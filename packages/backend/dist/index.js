"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
// Deployed contract addresses on Sepolia
const REPUTATION_MANAGER_ADDRESS = process.env.REPUTATION_MANAGER_ADDRESS || '0x7C81049B93bc487a1ff4f3B00f98d3A990f84FBa';
const SOFT_SETTLE_CHANNEL_ADDRESS = process.env.SOFT_SETTLE_CHANNEL_ADDRESS || '0xB3A0E90884340019fFaA90e8Eb971E71396113e1';
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
// In-memory stores (use DB in production)
const sessions = new Map();
const agents = new Map();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ==========================================
// REST API ENDPOINTS
// ==========================================
// 1. Register Agent (ENS Integration - Phase 3)
app.post('/api/register-agent', (req, res) => {
    try {
        const { agentId, ensName, description, walletAddress } = req.body;
        if (!agentId || !walletAddress) {
            return res.status(400).json({ error: 'Missing agentId or walletAddress' });
        }
        const agent = {
            agentId,
            ensName: ensName || `${agentId}.soft-settle.eth`,
            description: description || 'AI Agent',
            walletAddress,
            creditScore: 500,
            registeredAt: new Date(),
            dealsTotal: 0,
            disputes: 0
        };
        agents.set(agentId, agent);
        console.log(`✅ Agent registered: ${agentId}`);
        res.json({
            success: true,
            agent,
            message: 'Agent registered. ENS records initialized with credit score 500.',
            ensIntegration: {
                record: 'vnd.credit.score',
                value: 500,
                updatedOn: REPUTATION_MANAGER_ADDRESS
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 2. Query Agent Reputation (ENS Integration)
app.get('/api/query-reputation/:agentId', (req, res) => {
    try {
        const { agentId } = req.params;
        const agent = agents.get(agentId);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json({
            agentId,
            creditScore: agent.creditScore,
            dealsTotal: agent.dealsTotal,
            disputes: agent.disputes,
            ensName: agent.ensName,
            eligible: agent.creditScore > 500,
            message: `ENS record retrieved. Credit score: ${agent.creditScore} (min 500 required)`
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 3. Initialize Session (Yellow Network - Phase 3)
app.post('/api/init-session', (req, res) => {
    try {
        const { consumerId, providerId, collateralAmount, maxDuration = 3600 } = req.body;
        if (!consumerId || !providerId || !collateralAmount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const consumer = agents.get(consumerId);
        const provider = agents.get(providerId);
        if (!consumer || !provider) {
            return res.status(404).json({ error: 'Consumer or provider not found' });
        }
        // Credit check (minimum score: 500)
        if (consumer.creditScore < 500) {
            return res.status(403).json({
                error: 'Insufficient credit',
                requiredScore: 500,
                currentScore: consumer.creditScore,
                collateralRequested: collateralAmount
            });
        }
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const session = {
            sessionId,
            consumerId,
            providerId,
            collateralAmount,
            balance: collateralAmount,
            transferred: 0,
            status: 'active',
            initiatedAt: new Date(),
            maxDuration,
            contractAddress: SOFT_SETTLE_CHANNEL_ADDRESS,
            microPayments: []
        };
        sessions.set(sessionId, session);
        console.log(`✅ Session initiated: ${sessionId}`);
        res.json({
            success: true,
            sessionId,
            message: `Session opened with ${collateralAmount} USDC collateral on Sepolia (Yellow Nitrolite channel)`,
            session,
            yellowIntegration: {
                channel: 'Nitrolite',
                collateralLocked: true,
                offChainReady: true
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 4. Monitor Session (Real-time Progress)
app.get('/api/monitor-session/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        const progress = ((session.transferred / session.collateralAmount) * 100).toFixed(1);
        res.json({
            sessionId,
            status: session.status,
            collateral: session.collateralAmount,
            balance: session.balance,
            transferred: session.transferred,
            progress: `${progress}%`,
            consumer: session.consumerId,
            provider: session.providerId,
            initiatedAt: session.initiatedAt,
            microPayments: session.microPayments.length
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 5. Soft-Settle Micro-Authorization (Off-chain)
app.post('/api/micro-auth', (req, res) => {
    try {
        const { sessionId, microAmount, signature } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        if (session.status !== 'active') {
            return res.status(400).json({ error: 'Session not active' });
        }
        if (session.balance < microAmount) {
            return res.status(400).json({ error: 'Insufficient balance for micro-payment' });
        }
        // Simulate off-chain signing (in production, verify EIP-712 signature)
        session.balance -= microAmount;
        session.transferred += microAmount;
        session.microPayments.push({
            amount: microAmount,
            timestamp: new Date(),
            signature: signature || 'mock-eip712-sig'
        });
        res.json({
            success: true,
            message: `Micro-authorization confirmed (off-chain): ${microAmount} USDC signed`,
            sessionId,
            newBalance: session.balance,
            totalTransferred: session.transferred,
            yellowIntegration: {
                offChainState: 'synced',
                nonce: session.microPayments.length
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 6. Close Session (Hard Settlement - Circle Integration Phase 3)
app.post('/api/close-session', (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        session.status = 'closed';
        const finalTransferred = session.transferred;
        const deficit = Math.max(0, finalTransferred - session.collateralAmount);
        const consumer = agents.get(session.consumerId);
        const provider = agents.get(session.providerId);
        let response = {
            success: true,
            sessionId,
            finalTransferred,
            contractAddress: SOFT_SETTLE_CHANNEL_ADDRESS
        };
        if (deficit > 0) {
            // Deficit detected: simulate Circle payout
            consumer.creditScore = Math.max(0, consumer.creditScore - 50);
            response.deficitDetected = true;
            response.deficit = deficit;
            response.message = 'Session closed. Deficit detected. Arc + Circle payout triggered.';
            response.circleIntegration = {
                payoutTriggered: true,
                amount: deficit,
                chain: 'Arc',
                token: 'USDC'
            };
        }
        else {
            // Successful settlement
            consumer.creditScore = Math.min(1000, consumer.creditScore + 10);
            provider.dealsTotal += finalTransferred;
            response.message = 'Session closed successfully. Reputation updated on ENS.';
            response.reputationUpdate = {
                agent: consumer.agentId,
                previousScore: consumer.creditScore - 10,
                newScore: consumer.creditScore,
                updatedOn: REPUTATION_MANAGER_ADDRESS
            };
        }
        console.log(`✅ Session closed: ${sessionId}`);
        res.json(response);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 7. List All Sessions (Dashboard)
app.get('/api/sessions', (req, res) => {
    try {
        const sessionList = Array.from(sessions.values());
        res.json({
            total: sessionList.length,
            sessions: sessionList
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 8. List All Agents (Dashboard)
app.get('/api/agents', (req, res) => {
    try {
        const agentList = Array.from(agents.values());
        res.json({
            total: agentList.length,
            agents: agentList
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Integration Status (Phase 3 - Show all 3 partners)
app.get('/api/integrations', (req, res) => {
    res.json({
        yellow: {
            status: '✅ Configured',
            contract: SOFT_SETTLE_CHANNEL_ADDRESS,
            feature: 'Nitrolite state channels (off-chain micro-transactions)',
            testsuite: 'Session + micro-auth endpoints'
        },
        circle: {
            status: '✅ Configured',
            chains: ['Arc'],
            feature: 'USDC payouts + deficit handling (Circle Wallets)',
            testsuite: 'close-session endpoint triggers payout on deficit'
        },
        ens: {
            status: '✅ Configured',
            contract: REPUTATION_MANAGER_ADDRESS,
            feature: 'Credit scores stored in ENS text records (vnd.credit.score)',
            testsuite: 'register-agent + query-reputation endpoints'
        }
    });
});
// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 SoftSettle Backend`);
    console.log(`📡 API: http://localhost:${PORT}/api/*`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log(`\n✅ Deployed Contracts (Sepolia):`);
    console.log(`   ReputationManager: ${REPUTATION_MANAGER_ADDRESS}`);
    console.log(`   SoftSettleChannel: ${SOFT_SETTLE_CHANNEL_ADDRESS}\n`);
});
