"use strict";
// packages/offchain/src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNode = void 0;
exports.validateEIP712 = validateEIP712;
const libp2p_1 = require("libp2p");
const tcp_1 = require("@libp2p/tcp");
const libp2p_noise_1 = require("@chainsafe/libp2p-noise");
const libp2p_yamux_1 = require("@chainsafe/libp2p-yamux");
const it_all_1 = __importDefault(require("it-all"));
const uint8arraylist_1 = require("uint8arraylist");
const ethers_1 = require("ethers");
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
function validateEIP712(update, signature, expectedSigner) {
    try {
        const recovered = ethers_1.ethers.verifyTypedData(domain, types, update, signature);
        return recovered.toLowerCase() === expectedSigner.toLowerCase();
    }
    catch (error) {
        console.error("Signature Verification Failed:", error);
        return false;
    }
}
/**
 * -------------------------
 * Handle Work Unit
 * -------------------------
 */
async function handleWorkUnit(stream, workRequest, wallet) {
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
    }
    catch (err) {
        console.error('[P2P] Work unit handling failed:', err);
    }
}
/**
 * -------------------------
 * P2P Node Setup
 * -------------------------
 */
const createNode = async (wallet) => {
    const node = (await (0, libp2p_1.createLibp2p)({
        addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
        transports: [(0, tcp_1.tcp)()],
        connectionEncrypters: [(0, libp2p_noise_1.noise)()],
        streamMuxers: [(0, libp2p_yamux_1.yamux)()],
    }));
    await node.start();
    const [addr] = node.getMultiaddrs();
    console.log('Soft-Settle P2P Node started at:', addr?.toString());
    // Handle incoming micro-credit state updates
    node.handle('/soft-settle/1.0.0', async (stream) => {
        try {
            const chunks = await (0, it_all_1.default)(stream);
            const buffers = chunks.map((chunk) => chunk instanceof uint8arraylist_1.Uint8ArrayList ? chunk.subarray() : chunk);
            const data = Buffer.concat(buffers).toString('utf8');
            const message = JSON.parse(data);
            console.log('[P2P] Received state update:', message);
            await handleWorkUnit(stream, message, wallet);
        }
        catch (err) {
            console.error('[P2P] Stream handling error:', err);
        }
        finally {
            await stream.close();
        }
    });
    return node;
};
exports.createNode = createNode;
/**
 * -------------------------
 * Start Node
 * -------------------------
 */
(async () => {
    try {
        const privateKey = process.env.OFFCHAIN_WALLET_KEY;
        const wallet = new ethers_1.ethers.Wallet(privateKey);
        await (0, exports.createNode)(wallet);
    }
    catch (err) {
        console.error('[P2P] Node initialization failed:', err);
    }
})();
