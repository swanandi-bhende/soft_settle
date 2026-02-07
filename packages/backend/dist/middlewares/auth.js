"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySessionClosure = void 0;
const ethers_1 = require("ethers");
const verifySessionClosure = async (req, res, next) => {
    const { consumerSig, providerSig, sessionId, finalBalance } = req.body.variables;
    const message = `Close Session ${sessionId}: Final Balance ${finalBalance}`;
    try {
        const consumer = ethers_1.ethers.verifyMessage(message, consumerSig);
        const provider = ethers_1.ethers.verifyMessage(message, providerSig);
        // Validation logic: Ensure these addresses match the DB record for this session
        req.participants = { consumer, provider };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Invalid Multi-Sig for closure" });
    }
};
exports.verifySessionClosure = verifySessionClosure;
