"use strict";
// packages/backend/src/resolvers.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const ethers_1 = require("ethers");
const Agent_1 = require("../models/Agent");
const Session_1 = require("../models/Session");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const ipfs_1 = require("../integrations/ipfs"); // IPFS logging utility
// Use require for json2csv to avoid missing types
const { Parser } = require('json2csv');
// Initialize PubSub for subscriptions
const pubsub = new graphql_subscriptions_1.PubSub();
exports.resolvers = {
    Query: {
        getAgent: async (_, { domain }) => {
            return await Agent_1.Agent.findOne({ ensDomain: domain });
        },
        activeSessions: async () => await Session_1.Session.find({ status: 'active' }),
    },
    Mutation: {
        registerAgent: async (_, { domain, description, sig }) => {
            const message = `Register Soft-Settle Agent: ${domain}`;
            const recoveredAddress = ethers_1.ethers.verifyMessage(message, sig);
            const agent = await Agent_1.Agent.findOneAndUpdate({ ensDomain: domain }, { ensDomain: domain, description, walletAddress: recoveredAddress }, { upsert: true, new: true });
            return agent;
        },
        updateOffChainState: async (_, { sessionId, newBalance }) => {
            await Session_1.Session.findByIdAndUpdate(sessionId, { balance: newBalance });
            pubsub.publish('SESSION_UPDATED', {
                sessionProgress: { sessionId, newBalance },
            });
            pubsub.publish(`SESSION_${sessionId}`, {
                sessionUpdated: { id: sessionId, balance: newBalance, status: 'active' },
            });
            return true;
        },
        updateSessionState: async (_, { sessionId, balance }) => {
            const updated = { id: sessionId, balance, status: 'active' };
            pubsub.publish(`SESSION_${sessionId}`, { sessionUpdated: updated });
            return updated;
        },
        disputeSession: async (_, { sessionId, reason }) => {
            const session = await Session_1.Session.findOneAndUpdate({ sessionId }, { status: 'disputed' }, { new: true });
            if (!session)
                throw new Error("Session not found");
            // Log dispute event for audit trail
            session.logs.push({ timestamp: new Date(), event: `DISPUTE: ${reason}` });
            await session.save();
            return session;
        },
        exportReport: async (_, { sessionId }) => {
            const session = await Session_1.Session.findOne({ sessionId });
            if (!session)
                throw new Error("Session not found");
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(session.logs);
            const ipfsHash = await (0, ipfs_1.logToIPFS)({ sessionId, csv, finalizedAt: new Date() });
            return { hash: ipfsHash, data: csv };
        },
    },
    Subscription: {
        sessionProgress: {
            subscribe: () => pubsub.asyncIterator(['SESSION_UPDATED']),
        },
        sessionUpdated: {
            subscribe: (_, { sessionId }) => pubsub.asyncIterator([`SESSION_${sessionId}`]),
        },
    },
};
