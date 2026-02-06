// packages/backend/src/services/settlementService.ts

import { ethers } from 'ethers';
import { triggerDeficitPayout } from '../integrations/circle';
import { updateCreditScore } from '../integrations/ens';

/**
 * -------------------------
 * Provider & Contract Setup
 * -------------------------
 */

const provider = new ethers.JsonRpcProvider(
  process.env.ALCHEMY_RPC_URL
);

const channelAddress = process.env.SOFT_SETTLE_CHANNEL_ADDRESS!;
const channelAbi = [
  // event DeficitDetected(uint256 deficit)
  {
    type: 'event',
    name: 'DeficitDetected',
    inputs: [
      { name: 'deficit', type: 'uint256', indexed: false }
    ]
  },

  // event SessionClosed(address indexed consumerNode, bool successful, uint256 transferred)
  {
    type: 'event',
    name: 'SessionClosed',
    inputs: [
      { name: 'consumerNode', type: 'address', indexed: true },
      { name: 'successful', type: 'bool', indexed: false },
      { name: 'transferred', type: 'uint256', indexed: false }
    ]
  }
];

const channelContract = new ethers.Contract(
  channelAddress,
  channelAbi,
  provider
);

/**
 * -------------------------
 * Idempotency Helpers
 * -------------------------
 * Replace with DB-backed logic in production
 */

const processedTxs = new Set<string>();

async function alreadyProcessed(txHash: string): Promise<boolean> {
  return processedTxs.has(txHash);
}

async function markProcessed(txHash: string): Promise<void> {
  processedTxs.add(txHash);
}

/**
 * -------------------------
 * Event Listeners
 * -------------------------
 */

export function setupEventListeners() {
  /**
   * 🔔 DeficitDetected
   * → Trigger Circle payout
   */
  channelContract.on(
    'DeficitDetected',
    async (deficit: bigint, event) => {
      const txHash = event.log.transactionHash;

      if (await alreadyProcessed(txHash)) return;

      try {
        // TODO: resolve walletAddress from channel/session DB
        const walletAddress = 'consumer-wallet-address';

        await triggerDeficitPayout(
          walletAddress,
          deficit.toString()
        );

        await markProcessed(txHash);
        console.log(
          '[Circle] Deficit payout triggered:',
          deficit.toString()
        );
      } catch (err) {
        console.error('[Circle] Deficit payout failed:', err);
      }
    }
  );

  /**
   * 🔔 SessionClosed
   * → Update ENS-based reputation
   */
  channelContract.on(
    'SessionClosed',
    async (
      consumerNode: string,
      successful: boolean,
      transferred: bigint,
      event
    ) => {
      const txHash = event.log.transactionHash;

      if (await alreadyProcessed(txHash)) return;
      if (!successful) return;

      try {
        const ensDomain = await provider.lookupAddress(consumerNode);
        if (!ensDomain) return;

        // Example reputation logic (replace with real model)
        const volumeScore = Math.min(
          Number(transferred / 1_000_000n),
          100
        );
        const newScore = 650 + volumeScore;

        await updateCreditScore(ensDomain, newScore);

        await markProcessed(txHash);
        console.log('[Reputation] Updated for', ensDomain);
      } catch (err) {
        console.error('[Reputation] Update failed:', err);
      }
    }
  );

  console.log('✅ SoftSettle event listeners initialized');
}
