// packages/offchain/src/utils/sessionTracker.ts

import Redis, { Redis as RedisClient } from 'ioredis';

// Create Redis client
const redis: RedisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Atomically process a session update
 * @param sessionId - ID of the session
 * @param shift - Amount to shift the balance by
 * @param nonce - Nonce to prevent replay attacks
 * @returns New balance after applying the shift
 */
export async function processUpdate(sessionId: string, shift: bigint, nonce: number): Promise<bigint> {
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
