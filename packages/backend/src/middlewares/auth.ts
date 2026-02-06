import { ethers } from 'ethers';

export const verifySessionClosure = async (req: any, res: any, next: any) => {
    const { consumerSig, providerSig, sessionId, finalBalance } = req.body.variables;
    
    const message = `Close Session ${sessionId}: Final Balance ${finalBalance}`;
    
    try {
        const consumer = ethers.verifyMessage(message, consumerSig);
        const provider = ethers.verifyMessage(message, providerSig);
        
        // Validation logic: Ensure these addresses match the DB record for this session
        req.participants = { consumer, provider };
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid Multi-Sig for closure" });
    }
};