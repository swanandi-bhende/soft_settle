import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import Link from 'next/link';

const BACKEND_URL = 'http://localhost:4000';

interface Session {
  sessionId: string;
  consumer: string;
  provider: string;
  collateral: number;
  offChainBalance: number;
  status: 'active' | 'settled' | 'disputed';
  progress: number;
}

interface Agent {
  agentId: string;
  creditScore?: number;
}

interface Integration {
  name: string;
  status: string;
  badge: string;
  color: string;
  description: string;
}

export default function Dashboard() {
  const { address } = useAccount();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAgent, setNewAgent] = useState('');
  const [registering, setRegistering] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch sessions & agents on mount + poll every 2s
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessResp = await fetch('http://localhost:4000/api/sessions');
        const sessData = await sessResp.json();
        setSessions(sessData.sessions || []);

        // Mock agents for demo
        setAgents([
          { domain: 'researcher.eth', score: 750, totalDeals: 42 },
          { domain: 'scraper.eth', score: 890, totalDeals: 128 },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterAgent = async () => {
    if (!address || !newAgent) return;

    try {
      const resp = await fetch('http://localhost:4000/api/register-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ensDomain: newAgent,
          description: newAgentDesc,
          walletAddress: address,
        }),
      });

      const data = await resp.json();
      if (data.success) {
        setNewAgent('');
        setNewAgentDesc('');
        alert('✅ Agent registered!');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleInitSession = (consumerDomain: string, providerDomain: string) => {
    // Mock: Just show a demo session
    const newSession: Session = {
      sessionId: `sess_${Date.now()}`,
      consumer: consumerDomain,
      provider: providerDomain,
      collateral: 50,
      offChainBalance: 50,
      status: 'active',
      progress: 0,
    };

    setSessions([...sessions, newSession]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage agents & sessions</p>
          </div>
          <Link
            href="/"
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
          >
            Back
          </Link>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Register Agent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur"
          >
            <h2 className="text-2xl font-bold mb-6">📝 Register Agent</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="my-agent.eth"
                value={newAgent}
                onChange={(e) => setNewAgent(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <textarea
                placeholder="Agent description..."
                value={newAgentDesc}
                onChange={(e) => setNewAgentDesc(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 h-20"
              />
              <button
                onClick={handleRegisterAgent}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
              >
                Register
              </button>
            </div>

            {/* Agents List */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">🤖 Registered Agents</h3>
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.domain}
                    className="p-3 bg-white/10 border border-white/20 rounded-lg"
                  >
                    <p className="font-mono text-sm text-blue-400">{agent.domain}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Score: {agent.score} | Deals: {agent.totalDeals}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">⚡ Active Sessions</h2>
              <button
                onClick={() => handleInitSession('researcher.eth', 'scraper.eth')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold"
              >
                + New Session
              </button>
            </div>

            {loading ? (
              <p className="text-gray-400">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-gray-400">No active sessions</p>
            ) : (
              sessions.map((session) => (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-mono text-sm text-gray-400">{session.sessionId}</p>
                      <p className="text-lg font-bold mt-1">
                        {session.consumer} → {session.provider}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        session.status === 'active'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-gray-900/30 text-gray-400'
                      }`}
                    >
                      {session.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>{session.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${session.progress}%` }}
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Collateral</p>
                      <p className="text-lg font-bold">${session.collateral} USDC</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Off-Chain Balance</p>
                      <p className="text-lg font-bold text-green-400">${session.offChainBalance} USDC</p>
                    </div>
                  </div>

                  {/* Integration Badges */}
                  <div className="mt-4 flex gap-2">
                    <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-400 rounded">
                      💛 Yellow Network
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded">
                      💳 Circle/Arc
                    </span>
                    <span className="px-2 py-1 text-xs bg-purple-900/30 text-purple-400 rounded">
                      🆔 ENS
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
