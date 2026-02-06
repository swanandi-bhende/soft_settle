// packages/backend/src/models/Session.ts
import { Schema, model, Document } from 'mongoose';

export interface LogEntry {
  timestamp: Date;
  event: string;
}

export interface SessionDocument extends Document {
  sessionId: string;
  createdAt: Date;
  consumerAddress: string;
  providerAddress: string;
  currentBalance: number;
  balance?: number;
  deposit?: number;
  status: 'active' | 'closed' | 'disputed';
  ipfsAuditLink?: string;
  logs: LogEntry[];
}

const sessionSchema = new Schema<SessionDocument>({
  sessionId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  consumerAddress: { type: String, required: true },
  providerAddress: { type: String, required: true },
  currentBalance: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  deposit: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'closed', 'disputed'], default: 'active' },
  ipfsAuditLink: { type: String },
  logs: { type: [{ timestamp: Date, event: String }], default: [] },
});

export const Session = model<SessionDocument>('Session', sessionSchema);
