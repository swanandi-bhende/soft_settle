// packages/frontend/pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';

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
  color: string;
  description: string;
}

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

export default function Dashboard() {
  const { address } = useAccount();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAgent, setNewAgent] = useState('');
  const [registering, setRegistering] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessResp = await fetch(`${BACKEND_URL}/api/sessions`);
        const sessData = await sessResp.json();
        const sessionsList = sessData.sessions || [];
        setSessions(sessionsList.map((s: any) => ({
          ...s,
          progress: Math.min(100, (s.progress || 0) + Math.random() * 15),
        })));

        const agentResp = await fetch(`${BACKEND_URL}/api/agents`);
        const agentData = await agentResp.json();
        setAgents(agentData.agents || []);

        const intResp = await fetch(`${BACKEND_URL}/api/integrations`);
        const intData = await intResp.json();
        setIntegrations([
          {
            name: 'Yellow Network',
            status: intData.yellow?.status || 'Configured',
            color: 'yellow',
            description: intData.yellow?.feature || 'Nitrolite state channels',
          },
          {
            name: 'Circle/Arc',
            status: intData.circle?.status || 'Configured',
            color: 'blue',
            description: intData.circle?.feature || 'USDC payouts',
          },
          {
            name: 'ENS',
            status: intData.ens?.status || 'Configured',
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
        alert('Agent registered with ENS integration!');
        const agentResp = await fetch(`${BACKEND_URL}/api/agents`);
        const agentData = await agentResp.json();
        setAgents(agentData.agents || []);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed');
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
          deposit: 50,
        }),
      });

      const data = await resp.json();
      if (data.success) {
        alert('Session created!');
        const sessResp = await fetch(`${BACKEND_URL}/api/sessions`);
        const sessData = await sessResp.json();
        setSessions(sessData.sessions || []);
      }
    } catch (error) {
      console.error('Session creation failed:', error);
      alert('Session creation failed');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-300';
      case 'settled':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300';
      case 'disputed':
        return 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-300';
      default:
        return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-300';
    }
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <Header />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Manage your AI agents, sessions, and integrations</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Summary Stats */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="p-6 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700 backdrop-blur-sm"
              >
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Quick Stats</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-white">{agents.length}</p>
                    <p className="text-xs text-slate-400">Registered Agents</p>
                  </div>
                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-2xl font-bold text-white">{sessions.length}</p>
                    <p className="text-xs text-slate-400">Active Sessions</p>
                  </div>
                </div>
              </motion.div>

              {/* Integrations Card */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="p-6 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700 backdrop-blur-sm"
              >
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                  Integrations
                </h3>
                <div className="space-y-3">
                  {integrations.map((int) => (
                    <div key={int.name} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{int.name}</p>
                        <p className="text-xs text-slate-500 truncate">{int.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Register Agent Card */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="p-6 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm"
              >
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                  ➕ New Agent
                </h3>
                <input
                  type="text"
                  placeholder="agent-name.eth"
                  value={newAgent}
                  onChange={(e) => setNewAgent(e.target.value)}
                  className="w-full px-3 py-2 mb-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                <button
                  onClick={handleRegisterAgent}
                  disabled={registering || !address}
                  className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all duration-300"
                >
                  {registering ? 'Registering...' : 'Register'}
                </button>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Sessions Section */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700 backdrop-blur-sm overflow-hidden"
              >
                {/* Section Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-slate-700 bg-slate-800/30">
                  <h2 className="text-lg font-semibold text-white">Active Sessions</h2>
                  <button
                    onClick={handleInitSession}
                    disabled={creating || agents.length < 2}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium hover:from-green-500 hover:to-green-600 disabled:opacity-50 transition-all duration-300"
                  >
                    {creating ? 'Creating...' : '+ New Session'}
                  </button>
                </div>

                {/* Sessions Content */}
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400">Loading sessions...</p>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-300 font-medium">No active sessions yet</p>
                      <p className="text-slate-500 text-sm mt-2">
                        Register agents and create a session to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <motion.div
                          key={session.sessionId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => router.push(`/monitor?session=${encodeURIComponent(session.sessionId)}`)}
                          className="p-4 rounded-lg bg-slate-900/40 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="text-xs font-mono text-slate-500 mb-1">
                                {session.sessionId.slice(0, 12)}...
                              </p>
                              <p className="text-sm font-semibold text-white">
                                {session.consumer} → {session.provider}
                              </p>
                            </div>
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border bg-gradient-to-r ${getStatusColor(
                                session.status
                              )}`}
                            >
                              {session.status.toUpperCase()}
                            </motion.span>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                              <span>Settlement Progress</span>
                              <span className="font-mono font-semibold">
                                {Math.round(session.progress)}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${session.progress}%` }}
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                transition={{ duration: 0.8 }}
                              />
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                              <p className="text-xs text-slate-500 mb-1">Yellow Collateral</p>
                              <p className="text-lg font-semibold text-white">
                                ${session.collateral}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                              <p className="text-xs text-slate-500 mb-1">Circle Balance</p>
                              <p className="text-lg font-semibold text-white">
                                ${session.offChainBalance}
                              </p>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-900/30 text-yellow-300 border border-yellow-700/30">
                              Yellow
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-300 border border-blue-700/30">
                              Circle Arc
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}