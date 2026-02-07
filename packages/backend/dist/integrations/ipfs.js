"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logToIPFS = logToIPFS;
// packages/backend/src/integrations/ipfs.ts
async function logToIPFS(data) {
    console.log("[IPFS] Pinning data:", data);
    return "QmFakeHashForDemo"; // placeholder hash
}
