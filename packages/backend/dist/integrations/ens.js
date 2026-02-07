"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCreditScore = updateCreditScore;
const ethers_1 = require("ethers"); // Ethers v6
// Ethers v6: 'providers' is gone. Use JsonRpcProvider directly.
const rpcUrl = process.env.RPC_URL;
const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
const signer = new ethers_1.Wallet(process.env.ENS_MANAGER_KEY, provider);
/**
 * Updates ENS score using the modern functional approach.
 */
async function updateCreditScore(domain, score) {
    // Note: Modern ENSjs integrations often prefer viem clients
    // but if you are sticking with Ethers for the signer:
    console.log(`Updating ENS score for ${domain} to ${score}...`);
    // Using Ethers v6 Contract interaction as a fallback if ENSjs v3 
    // imports are giving you trouble in your specific environment:
    const PublicResolverABI = ["function setText(bytes32 node, string key, string value) external"];
    const resolverAddress = "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"; // Mainnet Public Resolver
    const resolver = new ethers_1.ethers.Contract(resolverAddress, PublicResolverABI, signer);
    const node = ethers_1.ethers.namehash(domain);
    const tx = await resolver.setText(node, 'vnd.soft-settle.score', score.toString());
    return await tx.wait();
}
