// packages/backend/src/graphql/resolvers.ts
import { ethers } from 'ethers';
import { PubSub } from 'graphql-subscriptions';
import { Redis } from 'ioredis'; 
import { logToIPFS } from '../integrations/ipfs';

const pubsub = new PubSub();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const resolvers = {
  Query: {
    getAgent: async (_: any, { domain }: { domain: string }) => {
      const data = await redis.get(`agent:${domain}`);
      return data ? JSON.parse(data) : null;
    },

    activeSessions: async () => {
      const keys = await redis.keys('session:*');
      const sessions = await Promise.all(keys.map(async (k) => JSON.parse((await redis.get(k))!)));
      return sessions.filter(s => s.status === 'active');
    },
  },

  Mutation: {
    registerAgent: async (_: any, { domain, description, sig }: any) => {
      const message = `Register Soft-Settle Agent: ${domain}`;
      const recoveredAddress = ethers.verifyMessage(message, sig);

      const agentData = {
        ensDomain: domain,
        description,
        walletAddress: recoveredAddress,
        createdAt: new Date().toISOString()
      };

      await redis.set(`agent:${domain}`, JSON.stringify(agentData));
      return agentData;
    },

    updateOffChainState: async (_: any, { sessionId, newBalance }: any) => {
      const sessionData = await redis.get(`session:${sessionId}`);
      if (!sessionData) throw new Error("Session not found");

      const session = JSON.parse(sessionData);
      session.balance = newBalance;
      
      await redis.set(`session:${sessionId}`, JSON.stringify(session));

      pubsub.publish('SESSION_UPDATED', {
        sessionProgress: { sessionId, newBalance },
      });

      return true;
    },

    disputeSession: async (_: any, { sessionId, reason }: { sessionId: string; reason: string }) => {
      const sessionData = await redis.get(`session:${sessionId}`);
      if (!sessionData) throw new Error("Session not found");

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