import { ethers } from 'ethers';
import { Agent } from '../models/Agent';
import { Session } from '../models/Session';

export const resolvers = {
  Query: {
    getAgent: async (_: any, { domain }: { domain: string }) => {
      return await Agent.findOne({ ensDomain: domain });
    },
    activeSessions: async () => await Session.find({ status: 'active' })
  },
  Mutation: {
    registerAgent: async (_: any, { domain, description, sig }: any) => {
      // Verify the agent actually owns the wallet they claim
      const message = `Register Soft-Settle Agent: ${domain}`;
      const recoveredAddress = ethers.verifyMessage(message, sig);

      const agent = await Agent.findOneAndUpdate(
        { ensDomain: domain },
        { ensDomain: domain, description, walletAddress: recoveredAddress },
        { upsert: true, new: true }
      );
      return agent;
    }
  }
};