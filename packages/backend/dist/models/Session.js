"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
// packages/backend/src/models/Session.ts
const mongoose_1 = require("mongoose");
const sessionSchema = new mongoose_1.Schema({
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
exports.Session = (0, mongoose_1.model)('Session', sessionSchema);
