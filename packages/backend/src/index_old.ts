import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import mongoose from 'mongoose';
import corsMiddleware from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/softsettle';

async function startServer() {
  const app = express();

  // Middleware
  app.use(corsMiddleware());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // MongoDB Connection
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(' MongoDB connected');
  } catch (error) {
    console.error(' MongoDB connection failed:', error);
  }

  // Apollo GraphQL Server
  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({ schema });

  useServer({ schema }, wsServer);

  await server.start();
  server.applyMiddleware({ app });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // ============ REST APIs for MVP Demo ============

  // 1. Register Agent (ENS Integration)
  app.post('/api/register-agent', async (req, res) => {
    try {
      const { ensDomain, description, walletAddress } = req.body;
      
      // Mock: Store agent with initial reputation (500) in ENS-like structure
      const agent = {
        ensDomain,
        description,
        walletAddress,
        reputation: { score: 500, totalDeals: 0, disputes: 0 },
        createdAt: new Date().toISOString(),
      };

      // In production: Write to ENS + DB
      console.log('✅ Agent registered:', agent);
      res.json({ success: true, agent });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 2. Query Reputation (ENS Text Records)
  app.get('/api/query-reputation/:domain', async (req, res) => {
    try {
      const { domain } = req.params;
      
      // Mock: Return reputation score (in real: fetched from ENS text records)
      const reputation = {
        domain,
        score: Math.floor(Math.random() * 500) + 500, // 500-1000
        totalDeals: Math.floor(Math.random() * 100),
        disputes: Math.floor(Math.random() * 5),
      };

      res.json({ success: true, reputation });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 3. Initialize Session (Yellow Network + Nitrolite)
  app.post('/api/init-session', async (req, res) => {
    try {
      const { consumerDomain, providerDomain, collateral } = req.body;
      
      // Mock: Simulate Nitrolite channel open on Sepolia contracts
      const sessionId = `sess_${Date.now()}`;
      const session = {
        sessionId,
        consumer: consumerDomain,
        provider: providerDomain,
        collateral, // e.g., 50 USDC
        status: 'active',
        offChainBalance: collateral,
        createdAt: new Date().toISOString(),
        contractAddress: '0x' + Math.random().toString(16).slice(2, 42), // Mock
      };

      console.log('✅ Session initiated:', session);
      res.json({ success: true, session });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 4. Micro-Authorization (Off-Chain State Update)
  app.post('/api/authorize', async (req, res) => {
    try {
      const { sessionId, amount, signature } = req.body;
      
      // Mock: Track off-chain transfer
      const update = {
        sessionId,
        amount,
        signature,
        timestamp: new Date().toISOString(),
        status: 'authorized',
      };

      console.log('✅ Micro-authorization recorded:', update);
      res.json({ success: true, update });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 5. Close Session + Settlement (Circle/Arc Payout)
  app.post('/api/close-session', async (req, res) => {
    try {
      const { sessionId, finalAmount } = req.body;
      
      // Mock: Detect deficit → trigger Circle payout
      const deficit = 0; // In real: finalAmount - collateral
      const hasDeficit = deficit > 0;

      const settlement = {
        sessionId,
        finalAmount,
        deficit,
        status: hasDeficit ? 'payout_triggered' : 'settled',
        payoutTx: hasDeficit ? '0x' + Math.random().toString(16).slice(2, 66) : null,
        timestamp: new Date().toISOString(),
      };

      console.log('✅ Session closed + settlement:', settlement);
      res.json({ success: true, settlement });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 6. Get Active Sessions (Real-time Feed)
  app.get('/api/sessions', async (req, res) => {
    try {
      // Mock: Return demo sessions for dashboard
      const sessions = [
        {
          sessionId: 'sess_demo_1',
          consumer: 'researcher.eth',
          provider: 'scraper.eth',
          collateral: 50,
          offChainBalance: 45.5,
          status: 'active',
          progress: 91,
        },
        {
          sessionId: 'sess_demo_2',
          consumer: 'agent2.eth',
          provider: 'provider2.eth',
          collateral: 100,
          offChainBalance: 75,
          status: 'active',
          progress: 75,
        },
      ];

      res.json({ success: true, sessions });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Start listening
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`REST API ready at http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error);