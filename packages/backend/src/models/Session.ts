import mongoose, { Schema } from 'mongoose';

const SessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  consumerAddress: { type: String, required: true },
  providerAddress: { type: String, required: true },
  deposit: Number,
  currentBalance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'closed', 'disputed'], default: 'active' },
  ipfsAuditLink: String, // Link to the full off-chain log
  createdAt: { type: Date, default: Date.now }
});

export const Session = mongoose.model('Session', SessionSchema);