// packages/backend/src/models/Agent.ts

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Agent Interface
 */
export interface IAgent extends Document {
  ensDomain: string;
  description?: string;
  apiEndpoint?: string;
  walletAddress: string;
  activeSessions: string[];
  isAvailable: boolean;
  reputation: {
    score: number;
    totalDeals: number;
    disputes: number;
  };
  createdAt: Date;
}

/**
 * Agent Schema
 */
const AgentSchema: Schema<IAgent> = new Schema({
  ensDomain: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  apiEndpoint: { type: String, default: '' },
  walletAddress: { type: String, required: true },
  activeSessions: [{ type: String, default: [] }],
  isAvailable: { type: Boolean, default: true },
  reputation: {
    score: { type: Number, default: 500 },
    totalDeals: { type: Number, default: 0 },
    disputes: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

export const Agent = mongoose.model<IAgent>('Agent', AgentSchema);
