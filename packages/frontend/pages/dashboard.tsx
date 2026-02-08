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
  ensName?: string;
  walletAddress?: string;
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
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutData, setPayoutData] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [microAuthLoading, setMicroAuthLoading] = useState(false);
  const [yellowLoading, setYellowLoading] = useState(false);
  const mapSessions = (raw: any[]) => raw.map((s: any) => ({
    sessionId: s.sessionId,
    consumer: s.consumerId || s.consumer || 'unknown',
    provider: s.providerId || s.provider || 'unknown',
    collateral: s.collateralAmount || s.collateral || 0,
    offChainBalance: s.balance || s.offChainBalance || 0,
    status: s.status || 'active',
    progress: Math.min(100, (((s.transferred || 0) / (s.collateralAmount || s.collateral || 1)) * 100) + (Math.random() * 10))
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessResp = await fetch(`${BACKEND_URL}/api/sessions`);
        const sessData = await sessResp.json();
        const sessionsList = sessData.sessions || [];
        setSessions(mapSessions(sessionsList));

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
          collateralAmount: 50,
        }),
      });

      const data = await resp.json();
      if (data.success) {
        alert('Session created!');
        const sessResp = await fetch(`${BACKEND_URL}/api/sessions`);
        const sessData = await sessResp.json();
        setSessions(mapSessions(sessData.sessions || []));
      }
    } catch (error) {
      console.error('Session creation failed:', error);
      alert('Session creation failed');
    } finally {
      setCreating(false);
    }
  };

  const handleMicroAuth = async (sessionId: string) => {
    setMicroAuthLoading(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/micro-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          microAmount: 5,
          signature: 'eip712-sig-' + Date.now(),
        }),
      });

      const data = await resp.json();
      if (data.success) {
        alert(`✅ Micro-payment sent! Balance: $${data.newBalance}`);
        // Refresh sessions
        const sessResp = await fetch(`${BACKEND_URL}/api/sessions`);
        const sessData = await sessResp.json();
        setSessions(mapSessions(sessData.sessions || []));
      }
    } catch (error) {
      console.error('Micro-auth failed:', error);
      alert('Micro-payment failed');
    } finally {
      setMicroAuthLoading(false);
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/api/close-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await resp.json();
      if (data.success) {
        setPayoutData(data);
        setShowPayoutModal(true);
        // Refresh sessions
        const sessResp = await fetch(`${BACKEND_URL}/api/sessions`);
        const sessData = await sessResp.json();
        setSessions(mapSessions(sessData.sessions || []));
      }
    } catch (error) {
      console.error('Close session failed:', error);
      alert('Failed to close session');
    }
  };

  const handleOpenYellowChannel = async (sessionId: string) => {
    setYellowLoading(true);
    try {
      const session = sessions.find(s => s.sessionId === sessionId);
      if (!session) {
        alert('Session not found');
        return;
      }

      const resp = await fetch(`${BACKEND_URL}/api/yellow/open-channel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          deposit: session.collateral,
          nonce: 0
        }),
      });

      const data = await resp.json();
      if (data.success) {
        alert(`✅ Nitrolite channel opened!\nStatus: ${data.yellowNetworkChannel.status}\nSDKDetected: ${data.yellowNetworkChannel.sdkDetected ? 'yes' : 'no'}\nReady for off-chain transactions`);
      }
    } catch (error) {
      console.error('Yellow channel failed:', error);
      alert('Failed to open Yellow channel');
    } finally {
      setYellowLoading(false);
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
            <div className="lg:col-span-3 space-y-6">
              {/* Agents Section */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700 backdrop-blur-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/30">
                  <h2 className="text-lg font-semibold text-white">Registered Agents</h2>
                </div>
                <div className="p-6">
                  {agents.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No agents registered yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {agents.map((agent) => {
                        const scoreColor = agent.creditScore! >= 700 ? 'text-green-400' : 
                                          agent.creditScore! >= 500 ? 'text-yellow-400' : 'text-red-400';
                        const badgeColor = agent.creditScore! >= 700 ? 'bg-green-900/30 border-green-700/30' : 
                                          agent.creditScore! >= 500 ? 'bg-yellow-900/30 border-yellow-700/30' : 'bg-red-900/30 border-red-700/30';
                        return (
                          <motion.div
                            key={agent.agentId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-lg bg-slate-900/40 border border-slate-700 hover:border-blue-500/30 transition-all"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-white">{agent.agentId}</p>
                                <p className="text-xs text-slate-500">{agent.ensName}</p>
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`px-3 py-1 rounded-full text-sm font-bold ${scoreColor} border ${badgeColor}`}
                              >
                                ⭐ {agent.creditScore}
                              </motion.div>
                            </div>
                            <div className="text-xs text-slate-400 font-mono truncate">{agent.walletAddress}</div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>

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
                          className="p-4 rounded-lg bg-slate-900/40 border border-slate-700 hover:border-blue-500/50 transition-all duration-300"
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

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/50">
                            <button
                              onClick={() => handleOpenYellowChannel(session.sessionId)}
                              disabled={yellowLoading}
                              className="flex-1 px-3 py-2 text-xs rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-medium hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 transition-all duration-300"
                            >
                              {yellowLoading ? 'Opening...' : '⚡ Nitrolite'}
                            </button>
                            <button
                              onClick={() => handleMicroAuth(session.sessionId)}
                              disabled={microAuthLoading || session.status !== 'active'}
                              className="flex-1 px-3 py-2 text-xs rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all duration-300"
                            >
                              {microAuthLoading ? 'Sending...' : 'Send $5'}
                            </button>
                            <button
                              onClick={() => handleCloseSession(session.sessionId)}
                              disabled={session.status !== 'active'}
                              className="flex-1 px-3 py-2 text-xs rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 transition-all duration-300"
                            >
                              Close & Settle
                            </button>
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

      {/* Payout Modal */}
      {showPayoutModal && payoutData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-8 shadow-2xl"
          >
            <div className="text-center mb-6">
              {payoutData.deficitDetected ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-900/30 border border-orange-700/30 mb-4">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Deficit Detected</h2>
                  <p className="text-slate-400">Circle payout has been triggered</p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 border border-green-700/30 mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Session Settled</h2>
                  <p className="text-slate-400">Reputation updated on ENS</p>
                </>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700">
                <p className="text-xs text-slate-500 mb-2">Total Transferred</p>
                <p className="text-2xl font-bold text-white">${payoutData.finalTransferred}</p>
              </div>

              {payoutData.deficitDetected && (
                <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-700/30">
                  <p className="text-xs text-orange-400 mb-2">🔄 Payout via Circle</p>
                  <p className="text-lg font-semibold text-orange-300">${payoutData.deficit} USDC</p>
                </div>
              )}

              {payoutData.reputationUpdate && (
                <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-700/30">
                  <p className="text-xs text-purple-400 mb-2">📊 ENS Reputation Updated</p>
                  <p className="text-sm text-purple-300">
                    Score: {payoutData.reputationUpdate.previousScore} → {payoutData.reputationUpdate.newScore}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-700 text-xs text-slate-400 font-mono">
                <p className="truncate">Tx: {payoutData.contractAddress}</p>
              </div>
            </div>

            <button
              onClick={() => setShowPayoutModal(false)}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}