// packages/backend/src/resolvers.ts

import { ethers } from 'ethers';
import { Agent } from '../models/Agent';
import { Session } from '../models/Session';
import { PubSub } from 'graphql-subscriptions';
import { logToIPFS } from '../integrations/ipfs'; // IPFS logging utility

// Use require for json2csv to avoid missing types
const { Parser } = require('json2csv');

// Initialize PubSub for subscriptions
const pubsub = new PubSub();

export const resolvers = {
  Query: {
    getAgent: async (_: any, { domain }: { domain: string }) => {
      return await Agent.findOne({ ensDomain: domain });
    },

    activeSessions: async () => await Session.find({ status: 'active' }),
  },

  Mutation: {
    registerAgent: async (_: any, { domain, description, sig }: any) => {
      const message = `Register Soft-Settle Agent: ${domain}`;
      const recoveredAddress = ethers.verifyMessage(message, sig);

      const agent = await Agent.findOneAndUpdate(
        { ensDomain: domain },
        { ensDomain: domain, description, walletAddress: recoveredAddress },
        { upsert: true, new: true }
      );

      return agent;
    },

    updateOffChainState: async (_: any, { sessionId, newBalance }: any) => {
      await Session.findByIdAndUpdate(sessionId, { balance: newBalance });

      pubsub.publish('SESSION_UPDATED', {
        sessionProgress: { sessionId, newBalance },
      });

      pubsub.publish(`SESSION_${sessionId}`, {
        sessionUpdated: { id: sessionId, balance: newBalance, status: 'active' },
      });

      return true;
    },

    updateSessionState: async (_: any, { sessionId, balance }: any) => {
      const updated = { id: sessionId, balance, status: 'active' };
      pubsub.publish(`SESSION_${sessionId}`, { sessionUpdated: updated });
      return updated;
    },

    disputeSession: async (_: any, { sessionId, reason }: { sessionId: string; reason: string }) => {
      const session = await Session.findOneAndUpdate(
        { sessionId },
        { status: 'disputed' },
        { new: true }
      );

      if (!session) throw new Error("Session not found");

      // Log dispute event for audit trail
      session.logs.push({ timestamp: new Date(), event: `DISPUTE: ${reason}` });
      await session.save();

      return session;
    },

    exportReport: async (_: any, { sessionId }: { sessionId: string }) => {
      const session = await Session.findOne({ sessionId });
      if (!session) throw new Error("Session not found");

      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(session.logs);

      const ipfsHash = await logToIPFS({ sessionId, csv, finalizedAt: new Date() });

      return { hash: ipfsHash, data: csv };
    },
  },

  Subscription: {
    sessionProgress: {
      subscribe: () => pubsub.asyncIterator(['SESSION_UPDATED']),
    },

    sessionUpdated: {
      subscribe: (_: any, { sessionId }: { sessionId: string }) =>
        pubsub.asyncIterator([`SESSION_${sessionId}`]),
    },
  },
};
