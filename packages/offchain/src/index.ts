// packages/offchain/src/index.ts

import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import all from 'it-all';
import { Uint8ArrayList } from 'uint8arraylist';
import { ethers } from 'ethers';

/**
 * Minimal type for Libp2p node to satisfy TypeScript
 */
interface Libp2pNode {
  start: () => Promise<void>;
  getMultiaddrs: () => string[];
  handle: (protocol: string, handler: (stream: any) => Promise<void>) => void;
}

/**
 * -------------------------
 * EIP-712 Domain & Types
 * -------------------------
 */
const domain = {
  name: 'SoftSettleChannel',
  version: '1',
  chainId: 80001, // Polygon Mumbai
  verifyingContract: process.env.CHANNEL_ADDRESS,
};

const types = {
  StateUpdate: [
    { name: 'shiftAmount', type: 'uint256' },
    { name: 'newBalance', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
};

/**
 * -------------------------
 * Validate Typed Data Signature
 * -------------------------
 */
export function validateEIP712(
  update: { shiftAmount: bigint; newBalance: bigint; nonce: bigint },
  signature: string,
  expectedSigner: string
): boolean {
  try {
    const recovered = ethers.verifyTypedData(domain, types, update, signature);
    return recovered.toLowerCase() === expectedSigner.toLowerCase();
  } catch (error) {
    console.error("Signature Verification Failed:", error);
    return false;
  }
}

/**
 * -------------------------
 * Handle Work Unit
 * -------------------------
 */
async function handleWorkUnit(
  stream: { write: (data: Uint8Array) => Promise<void>; close: () => Promise<void> },
  workRequest: { currentBalance: number; cost: number; nonce: number },
  wallet: ethers.Wallet
) {
  try {
    // Calculate new state
    const newState = {
      balance: workRequest.currentBalance + workRequest.cost,
      nonce: workRequest.nonce + 1,
    };

    // Sign the state (EIP-712 style)
    const message = `Shift cost: ${workRequest.cost}; New total: ${newState.balance}`;
    const signature = await wallet.signMessage(message);

    // Send back to the provider
    const payload = JSON.stringify({ state: newState, signature });
    await stream.write(new TextEncoder().encode(payload));

    console.log('[P2P] Work unit response sent:', payload);
  } catch (err) {
    console.error('[P2P] Work unit handling failed:', err);
  }
}

/**
 * -------------------------
 * P2P Node Setup
 * -------------------------
 */
export const createNode = async (wallet: ethers.Wallet) => {
  const node: Libp2pNode = (await createLibp2p({
    addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
    transports: [tcp()],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
  })) as any;

  await node.start();

  const [addr] = node.getMultiaddrs();
  console.log('Soft-Settle P2P Node started at:', addr?.toString());

  // Handle incoming micro-credit state updates
  node.handle('/soft-settle/1.0.0', async (stream: any) => {
    try {
      const chunks: Uint8Array[] | Uint8ArrayList[] = await all(stream);
      const buffers = chunks.map((chunk) =>
        chunk instanceof Uint8ArrayList ? chunk.slice() : chunk
      );

      const data = Buffer.concat(buffers).toString('utf8');
      const message = JSON.parse(data);

      console.log('[P2P] Received state update:', message);

      await handleWorkUnit(stream, message, wallet);
    } catch (err) {
      console.error('[P2P] Stream handling error:', err);
    } finally {
      await stream.close();
    }
  });

  return node;
};

/**
 * -------------------------
 * Start Node
 * -------------------------
 */
(async () => {
  try {
    const privateKey = process.env.OFFCHAIN_WALLET_KEY!;
    const wallet = new ethers.Wallet(privateKey);

    await createNode(wallet);
  } catch (err) {
    console.error('[P2P] Node initialization failed:', err);
  }
})();
