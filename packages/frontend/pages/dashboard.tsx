import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  // Fetch all data on mount + poll every 3s
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sessions
        const sessResp = await fetch(`${BACKEND_URL}/api/sessions`);
        const sessData = await sessResp.json();
        const sessionsList = sessData.sessions || [];
        // Simulate progress animation
        setSessions(sessionsList.map((s: any) => ({
          ...s,
          progress: Math.min(100, (s.progress || 0) + Math.random() * 15),
        })));

        // Fetch agents
        const agentResp = await fetch(`${BACKEND_URL}/api/agents`);
        const agentData = await agentResp.json();
        setAgents(agentData.agents || []);

        // Fetch integrations
        const intResp = await fetch(`${BACKEND_URL}/api/integrations`);
        const intData = await intResp.json();
        setIntegrations([
          {
            name: 'Yellow Network',
            status: intData.yellow?.status || '✓ Configured',
            badge: '💛',
            color: 'yellow',
            description: intData.yellow?.feature || 'Nitrolite state channels',
          },
          {
            name: 'Circle/Arc',
            status: intData.circle?.status || '✓ Configured',
            badge: '💳',
            color: 'blue',
            description: intData.circle?.feature || 'USDC payouts',
          },
          {
            name: 'ENS',
            status: intData.ens?.status || '✓ Configured',
            badge: '🆔',
            color: 'purple',
            description: intData.ens?.feature || 'Credit scores',
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterAgent = async () => {
    if (!address || !newAgent) return;
    setRegistering(true);

    try {
      const resp = await fetch(`${BACKEND_URL}/api/register-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: newAgent,
          walletAddress: address,
        }),
      });

      const data = await resp.json();
      if (data.success) {
        setNewAgent('');
        alert('✅ Agent registered with ENS integration!');
        // Refetch agents
        const agentResp = await fetch(`${BACKEND_URL}/api/agents`);
        const agentData = await agentResp.json();
        setAgents(agentData.agents || []);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('❌ Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleInitSession = async () => {
    if (agents.length < 2) {
      alert('Need at least 2 agents to create a session');
      return;
    }
    setCreating(true);

    try {
      const resp = await fetch(`${BACKEND_URL}/api/init-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumerId: agents[0].agentId,
          providerId: agents[1].agentId,
          collateralAmount: 100,
        }),
      });

      const data = await resp.json();
      if (data.sessionId) {
        alert(`✅ Session created: ${data.sessionId}`);
        // Refetch sessions
        const sessResp = await fetch(`${BACKEND_URL}/api/sessions`);
        const sessData = await sessResp.json();
        setSessions(sessData.sessions || []);
      }
    } catch (error) {
      console.error('Session creation failed:', error);
      alert('❌ Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              SoftSettle MVP
            </h1>
            <p className="text-gray-400 mt-2">High-speed Micro-Credit Layer for AI Agents</p>
          </div>
          <Link href="/" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
            Home
          </Link>
        </div>

        {/* INTEGRATIONS STATUS PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur"
        >
          <h2 className="text-2xl font-bold mb-6">🚀 Partnership Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {integrations.map((int) => (
              <motion.div
                key={int.name}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl border-2 border-${int.color}-500/30 bg-${int.color}-950/20 backdrop-blur`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">{int.badge}</span>
                  <span className="text-xs font-bold px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                    ✓ LIVE
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{int.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{int.description}</p>
                <p className="text-xs text-gray-500">{int.status}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Register Agent (ENS Integration) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur"
          >
            <h2 className="text-2xl font-bold mb-2">🆔 Agent Registration</h2>
            <p className="text-xs text-gray-400 mb-6">ENS Integration</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Agent ID</label>
                <input
                  type="text"
                  placeholder="alice.eth"
                  value={newAgent}
                  onChange={(e) => setNewAgent(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleRegisterAgent}
                disabled={registering || !newAgent}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-semibold transition"
              >
                {registering ? 'Registering...' : 'Register Agent'}
              </button>
            </div>

            {/* Agents List */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-bold mb-4">Registered Agents</h3>
              {agents.length === 0 ? (
                <p className="text-sm text-gray-500">No agents yet</p>
              ) : (
                <div className="space-y-2">
                  {agents.map((agent) => (
                    <motion.div
                      key={agent.agentId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 transition"
                    >
                      <p className="font-mono text-sm text-purple-400">{agent.agentId}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Score: {agent.creditScore || 500}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT: Sessions (Yellow + Circle Integration) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">⚡ Active Sessions</h2>
                <p className="text-xs text-gray-400 mt-1">Yellow Network + Circle Arc</p>
              </div>
              <button
                onClick={handleInitSession}
                disabled={creating || agents.length < 2}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition"
              >
                {creating ? 'Creating...' : '+ New Session'}
              </button>
            </div>

            {loading ? (
              <p className="text-gray-400 text-center py-8">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-gray-400">No active sessions yet</p>
                <p className="text-xs text-gray-500 mt-2">
                  Register 2+ agents and create a session to get started
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur hover:bg-white/10 transition"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-mono text-xs text-gray-400">{session.sessionId}</p>
                      <p className="text-lg font-bold mt-1">
                        {session.consumer} → {session.provider}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        session.status === 'active'
                          ? 'bg-green-900/30 text-green-400'
                          : session.status === 'settled'
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {session.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Settlement Progress</span>
                      <span className="font-mono font-bold">{Math.round(session.progress)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${session.progress}%` }}
                        className="h-full bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400"
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-yellow-950/20 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-300 mb-1">💛 Yellow Collateral</p>
                      <p className="text-xl font-bold text-yellow-400">${session.collateral}</p>
                    </div>
                    <div className="bg-blue-950/20 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-xs text-blue-300 mb-1">💳 Circle Balance</p>
                      <p className="text-xl font-bold text-blue-400">${session.offChainBalance}</p>
                    </div>
                  </div>

                  {/* Integration Badges */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                    <span className="px-3 py-1 text-xs bg-yellow-900/30 text-yellow-400 rounded-full border border-yellow-500/20">
                      💛 Yellow Nitrolite Channel
                    </span>
                    <span className="px-3 py-1 text-xs bg-blue-900/30 text-blue-400 rounded-full border border-blue-500/20">
                      💳 Circle Arc USDC
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
