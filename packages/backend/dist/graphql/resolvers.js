"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
// packages/backend/src/graphql/resolvers.ts
const ethers_1 = require("ethers");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const ioredis_1 = require("ioredis");
const pubsub = new graphql_subscriptions_1.PubSub();
const redis = new ioredis_1.Redis(process.env.REDIS_URL || 'redis://localhost:6379');
exports.resolvers = {
    Query: {
        getAgent: async (_, { domain }) => {
            const data = await redis.get(`agent:${domain}`);
            return data ? JSON.parse(data) : null;
        },
        activeSessions: async () => {
            const keys = await redis.keys('session:*');
            const sessions = await Promise.all(keys.map(async (k) => JSON.parse((await redis.get(k)))));
            return sessions.filter(s => s.status === 'active');
        },
    },
    Mutation: {
        registerAgent: async (_, { domain, description, sig }) => {
            const message = `Register Soft-Settle Agent: ${domain}`;
            const recoveredAddress = ethers_1.ethers.verifyMessage(message, sig);
            const agentData = {
                ensDomain: domain,
                description,
                walletAddress: recoveredAddress,
                createdAt: new Date().toISOString()
            };
            await redis.set(`agent:${domain}`, JSON.stringify(agentData));
            return agentData;
        },
        updateOffChainState: async (_, { sessionId, newBalance }) => {
            const sessionData = await redis.get(`session:${sessionId}`);
            if (!sessionData)
                throw new Error("Session not found");
            const session = JSON.parse(sessionData);
            session.balance = newBalance;
            await redis.set(`session:${sessionId}`, JSON.stringify(session));
            pubsub.publish('SESSION_UPDATED', {
                sessionProgress: { sessionId, newBalance },
            });
            return true;
        },
        disputeSession: async (_, { sessionId, reason }) => {
            const sessionData = await redis.get(`session:${sessionId}`);
            if (!sessionData)
                throw new Error("Session not found");
            const session = JSON.parse(sessionData);
            session.status = 'disputed';
            session.logs.push({ timestamp: new Date(), event: `DISPUTE: ${reason}` });
            await redis.set(`session:${sessionId}`, JSON.stringify(session));
            return session;
        },
    },
    Subscription: {
        sessionProgress: {
            subscribe: () => pubsub.asyncIterator(['SESSION_UPDATED']),
        },
    },
};
