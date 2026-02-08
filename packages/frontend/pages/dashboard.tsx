// packages/frontend/pages/dashboard.tsx
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-5xl font-bold text-white">Dashboard</h1>
          <p className="mt-3 text-lg text-gray-300">Manage your agents, sessions, and integrations seamlessly.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar for Integrations and Registration */}
          <div className="lg:col-span-1 space-y-10">
            <section className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-white">Partnership Integrations</h2>
              <div className="space-y-6">
                {integrations.map((int) => (
                  <div key={int.name} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{int.name}</p>
                      <p className="text-sm text-gray-400">{int.description}</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-xs font-medium bg-${int.color}-900/30 text-${int.color}-400`}>
                      {int.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-8 w-full py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition duration-300 text-sm font-medium">
                + New Integration
              </button>
            </section>

            <section className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-white">Register Agent</h2>
              <input
                className="w-full p-4 mb-6 bg-gray-900 text-white border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 transition duration-200"
                placeholder="agent-name.eth"
                value={newAgent}
                onChange={(e) => setNewAgent(e.target.value)}
              />
              <button
                onClick={handleRegisterAgent}
                disabled={registering || !address}
                className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition duration-300 font-medium"
              >
                {registering ? 'Registering...' : 'Register Agent'}
              </button>
            </section>
          </div>

          {/* Main Content for Sessions */}
          <div className="lg:col-span-3">
            <section className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-white">Active Sessions</h2>
                <button
                  onClick={handleInitSession}
                  disabled={creating || agents.length < 2}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition duration-300"
                >
                  {creating ? 'Creating...' : '+ New Session'}
                </button>
              </div>

              {loading ? (
                <p className="text-gray-400 text-center py-12">Loading sessions...</p>
              ) : sessions.length === 0 ? (
                <div className="text-center py-16 bg-gray-900/50 border border-gray-700 rounded-2xl">
                  <p className="text-gray-300 text-lg">No active sessions yet</p>
                  <p className="text-sm text-gray-500 mt-3">
                    Register at least two agents and create a session to begin
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {sessions.map((session) => (
                    <motion.div
                      key={session.sessionId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gray-900/50 border border-gray-700 rounded-2xl p-8"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="font-mono text-sm text-gray-400">{session.sessionId}</p>
                          <p className="text-xl font-semibold mt-2 text-white">
                            {session.consumer} → {session.provider}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
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

                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-400 mb-3">
                          <span>Settlement Progress</span>
                          <span className="font-mono">{Math.round(session.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${session.progress}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                          <p className="text-sm text-gray-400 mb-2">Yellow Collateral</p>
                          <p className="text-2xl font-semibold text-white">${session.collateral}</p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                          <p className="text-sm text-gray-400 mb-2">Circle Balance</p>
                          <p className="text-2xl font-semibold text-white">${session.offChainBalance}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-700">
                        <span className="px-4 py-2 text-sm bg-yellow-900/30 text-yellow-400 rounded-full border border-yellow-700/50">
                          Yellow Nitrolite Channel
                        </span>
                        <span className="px-4 py-2 text-sm bg-blue-900/30 text-blue-400 rounded-full border border-blue-700/50">
                          Circle Arc USDC
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}