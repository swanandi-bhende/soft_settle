import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  ensDomain: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  currentScore: { type: Number, default: 500 },
  activeSessions: [{ type: String }],
  isAvailable: { type: Boolean, default: true }
});

export const Agent = mongoose.model('Agent', AgentSchema);