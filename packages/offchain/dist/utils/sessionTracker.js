"use strict";
// packages/offchain/src/utils/sessionTracker.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUpdate = processUpdate;
const ioredis_1 = __importDefault(require("ioredis"));
// Create Redis client
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
/**
 * Atomically process a session update
 * @param sessionId - ID of the session
 * @param shift - Amount to shift the balance by
 * @param nonce - Nonce to prevent replay attacks
 * @returns New balance after applying the shift
 */
async function processUpdate(sessionId, shift, nonce) {
    const key = `session:${sessionId}`;
    // Fetch current balance and last nonce
    const [currentBalanceStr, lastNonceStr] = await redis.hmget(key, 'balance', 'nonce');
    const lastNonce = parseInt(lastNonceStr || '0');
    // Check for replay attacks
    if (nonce <= lastNonce) {
        throw new Error("Replay Attack Detected: Nonce too low");
    }
    // Calculate new balance
    const currentBalance = BigInt(currentBalanceStr || '0');
    const newBalance = currentBalance + shift;
    // Atomically update Redis hash
    await redis.hmset(key, {
        balance: newBalance.toString(),
        nonce: nonce.toString()
    });
    return newBalance;
}
