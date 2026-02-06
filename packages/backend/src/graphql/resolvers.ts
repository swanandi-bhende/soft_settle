// packages/backend/src/resolvers.ts

import { ethers } from 'ethers';
import { Agent } from '../models/Agent';
import { Session } from '../models/Session';
import { PubSub } from 'graphql-subscriptions';

// Initialize PubSub for subscriptions
const pubsub = new PubSub();

export const resolvers = {
  Query: {
    /**
     * Get an agent by ENS domain
     */
    getAgent: async (_: any, { domain }: { domain: string }) => {
      return await Agent.findOne({ ensDomain: domain });
    },

    /**
     * List all active sessions
     */
    activeSessions: async () => await Session.find({ status: 'active' }),
  },

  Mutation: {
    /**
     * Register a new agent (or update existing)
     */
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

    /**
     * Update off-chain session state and notify subscribers
     */
    updateOffChainState: async (_: any, { sessionId, newBalance }: any) => {
      // Update the session in DB
      await Session.findByIdAndUpdate(sessionId, { balance: newBalance });

      // Publish update for global subscription
      pubsub.publish('SESSION_UPDATED', {
        sessionProgress: { sessionId, newBalance },
      });

      // Publish per-session update
      pubsub.publish(`SESSION_${sessionId}`, {
        sessionUpdated: { id: sessionId, balance: newBalance, status: 'active' },
      });

      return true;
    },

    /**
     * Update session state for a specific session (used by off-chain relay)
     */
    updateSessionState: async (_: any, { sessionId, balance }: any) => {
      const updated = { id: sessionId, balance, status: 'active' };

      // Publish per-session subscription event
      pubsub.publish(`SESSION_${sessionId}`, { sessionUpdated: updated });

      return updated;
    },
  },

  Subscription: {
    /**
     * Global session progress subscription
     */
    sessionProgress: {
      subscribe: () => pubsub.asyncIterator(['SESSION_UPDATED']),
    },

    /**
     * Subscription for a specific session
     */
    sessionUpdated: {
      subscribe: (_: any, { sessionId }: { sessionId: string }) =>
        pubsub.asyncIterator([`SESSION_${sessionId}`]),
    },
  },
};
