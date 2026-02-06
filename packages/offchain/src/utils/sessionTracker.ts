import Redis, { Redis as RedisClient } from 'ioredis';

const redis: RedisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function processUpdate(sessionId: string, shift: bigint, nonce: number) {
    const key = `session:${sessionId}`;
    
    // Atomic update to prevent race conditions
    const [currentBalance, lastNonce] = await redis.hmget(key, 'balance', 'nonce');
    
    if (nonce <= parseInt(lastNonce || '0')) {
        throw new Error("Invalid Nonce: Replay detected");
    }

    const newBalance = BigInt(currentBalance || '0') + shift;
    await redis.hmset(key, {
        balance: newBalance.toString(),
        nonce: nonce.toString()
    });

    return newBalance;
}
