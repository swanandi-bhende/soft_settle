"use strict";
// packages/backend/src/services/settlementService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEventListeners = setupEventListeners;
const ethers_1 = require("ethers");
const circle_1 = require("../integrations/circle");
const ens_1 = require("../integrations/ens");
/**
 * -------------------------
 * Environment & Provider
 * -------------------------
 */
const RPC_URL = process.env.ALCHEMY_RPC_URL || process.env.RPC_URL;
const CHANNEL_ADDRESS = process.env.SOFT_SETTLE_CHANNEL_ADDRESS || process.env.CHANNEL_ADDRESS;
const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
/**
 * -------------------------
 * Contract Setup
 * -------------------------
 */
const channelAbi = [
    // Event: DeficitDetected(address indexed consumer, uint256 amount)
    {
        type: 'event',
        name: 'DeficitDetected',
        inputs: [
            { name: 'consumer', type: 'address', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false }
        ]
    },
    // Event: SessionClosed(address indexed consumerNode, bool successful, uint256 transferred)
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
const channelContract = new ethers_1.ethers.Contract(CHANNEL_ADDRESS, channelAbi, provider);
/**
 * -------------------------
 * Idempotency Helpers
 * -------------------------
 * In production, replace with DB-backed tracking
 */
const processedTxs = new Set();
async function alreadyProcessed(txHash) {
    return processedTxs.has(txHash);
}
async function markProcessed(txHash) {
    processedTxs.add(txHash);
}
/**
 * -------------------------
 * Event Listeners
 * -------------------------
 */
function setupEventListeners() {
    console.log(' SoftSettle event listeners initializing...');
    /**
     * 🔔 DeficitDetected → trigger Circle payout
     */
    channelContract.on('DeficitDetected', async (consumer, amount, event) => {
        const txHash = event.log.transactionHash;
        if (await alreadyProcessed(txHash))
            return;
        try {
            // Resolve Circle Wallet ID for the consumer
            const consumerWalletAddress = consumer; // Replace with DB lookup if needed
            // Trigger off-chain payout via Circle
            await (0, circle_1.triggerDeficitPayout)(consumerWalletAddress, ethers_1.ethers.formatUnits(amount, 6) // Assuming USDC 6 decimals
            );
            await markProcessed(txHash);
            console.log(` [Circle] Deficit payout triggered for ${consumer}: ${ethers_1.ethers.formatUnits(amount, 6)} USDC`);
        }
        catch (err) {
            console.error('[Circle] Deficit payout failed:', err);
        }
    });
    /**
     * 🔔 SessionClosed → update ENS-based reputation
     */
    channelContract.on('SessionClosed', async (consumerNode, successful, transferred, event) => {
        const txHash = event.log.transactionHash;
        if (await alreadyProcessed(txHash))
            return;
        if (!successful)
            return;
        try {
            const ensDomain = await provider.lookupAddress(consumerNode);
            if (!ensDomain)
                return;
            // Simple reputation scoring example
            const volumeScore = Math.min(Number(transferred / 1000000n), 100);
            const newScore = 650 + volumeScore;
            await (0, ens_1.updateCreditScore)(ensDomain, newScore);
            await markProcessed(txHash);
            console.log(`[Reputation] Updated for ENS domain ${ensDomain} with score ${newScore}`);
        }
        catch (err) {
            console.error('[Reputation] Update failed:', err);
        }
    });
    console.log(' SoftSettle event listeners initialized');
}
