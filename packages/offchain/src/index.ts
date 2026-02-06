// packages/offchain/src/index.ts

import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import all from 'it-all';
import { Uint8ArrayList } from 'uint8arraylist';
import { ethers } from 'ethers';

/**
 * -------------------------
 * P2P Node Setup
 * -------------------------
 */
export const createNode = async (wallet: ethers.Wallet) => {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp()],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()]
  });

  await node.start();

  const [addr] = node.getMultiaddrs();
  console.log('Soft-Settle P2P Node started at:', addr?.toString());

  /**
   * -------------------------
   * Handle incoming micro-credit state updates
   * -------------------------
   */
  node.handle('/soft-settle/1.0.0', async (stream) => {
    try {
      // Collect all chunks from the stream
      const chunks = await all(stream); // Uint8ArrayList[]
      
      // Convert all chunks to Uint8Array
      const buffers = chunks.map((chunk) =>
        chunk instanceof Uint8ArrayList ? chunk.slice() : chunk
      );

      const data = Buffer.concat(buffers).toString('utf8');
      const message = JSON.parse(data);

      console.log('[P2P] Received state update:', message);

      // Handle work unit
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
 * Handle Work Unit
 * -------------------------
 */
async function handleWorkUnit(
  stream: any,
  workRequest: { currentBalance: number; cost: number; nonce: number },
  wallet: ethers.Wallet
) {
  try {
    // 1. Calculate new state
    const newState = {
      balance: workRequest.currentBalance + workRequest.cost,
      nonce: workRequest.nonce + 1
    };

    // 2. Sign the state (EIP-712 style)
    const message = `Shift cost: ${workRequest.cost}; New total: ${newState.balance}`;
    const signature = await wallet.signMessage(message);

    // 3. Send back to the provider
    const payload = JSON.stringify({
      state: newState,
      signature: signature
    });

    // Write back as Uint8Array
    await stream.write(new TextEncoder().encode(payload));
    console.log('[P2P] Work unit response sent:', payload);
  } catch (err) {
    console.error('[P2P] Work unit handling failed:', err);
  }
}

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
