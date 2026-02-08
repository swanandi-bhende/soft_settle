'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import SessionMonitor from '../components/SessionMonitor';
import { useRouter } from 'next/router';

interface Session {
  sessionId: string;
  participant1: string;
  participant2: string;
  status: 'initiating' | 'active' | 'closing';
  duration: number;
  microPayments: number;
}

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

export default function Monitor() {
  const [sessions] = useState<Session[]>([
    {
      sessionId: 'sess_0x1a2b3c',
      participant1: 'agent-1.eth',
      participant2: 'agent-2.eth',
      status: 'active',
      duration: 2400,
      microPayments: 127,
    },
    {
      sessionId: 'sess_0x4d5e6f',
      participant1: 'trader-agent.eth',
      participant2: 'market-maker.eth',
      status: 'active',
      duration: 1800,
      microPayments: 89,
    },
  ]);

  const [selectedSession, setSelectedSession] = useState<Session | null>(sessions[0]);

  const router = useRouter();

  useEffect(() => {
    // If a session query param is present, try to pre-select the matching session
    const q = (router.query?.session as string) || (router.asPath?.split('?session=')[1] as string);
    if (q) {
      const decoded = decodeURIComponent(q.split('&')[0]);
      const found = sessions.find((s) => s.sessionId === decoded);
      if (found) setSelectedSession(found);
    }
  }, [router.query]);

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
            <h1 className="text-4xl font-bold text-white mb-2">Session Monitor</h1>
            <p className="text-slate-400">Real-time oversight of active micro-credit sessions</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sessions List Sidebar */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700 backdrop-blur-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/30">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Active Sessions
                </h2>
              </div>

              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <motion.button
                    key={session.sessionId}
                    onClick={() => setSelectedSession(session)}
                    whileHover={{ x: 4 }}
                    className={`w-full p-4 rounded-lg transition-all duration-300 text-left ${
                      selectedSession?.sessionId === session.sessionId
                        ? 'bg-blue-600/20 border border-blue-500/50 shadow-lg shadow-blue-500/20'
                        : 'bg-slate-900/30 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-mono text-slate-400">
                        {session.sessionId}
                      </p>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-white truncate">
                      {session.participant1}
                    </p>
                    <p className="text-xs text-slate-500">→ {session.participant2}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Main Monitor Section */}
            {selectedSession && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="lg:col-span-2 space-y-6"
              >
                {/* Session Header */}
                <motion.div
                  className="rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700 backdrop-blur-sm p-6"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Session Monitor
                      </h2>
                      <p className="text-slate-400 text-sm">
                        {selectedSession.participant1} ↔ {selectedSession.participant2}
                      </p>
                    </div>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30"
                    >
                      {selectedSession.status.toUpperCase()}
                    </motion.span>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-500 mb-1 uppercase">Duration</p>
                      <p className="text-2xl font-bold text-white">
                        {Math.floor(selectedSession.duration / 60)}m
                      </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-500 mb-1 uppercase">Micro-Payments</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {selectedSession.microPayments}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-500 mb-1 uppercase">TPS Rate</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {(selectedSession.microPayments / (selectedSession.duration / 60)).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Session Monitor Card */}
                <SessionMonitor
                  sessionData={{
                    sessionId: selectedSession.sessionId,
                    deposit: 50,
                    currentBalance: Math.random() * 50,
                  }}
                />

                {/* Activity Feed */}
                <motion.div
                  className="rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700 backdrop-blur-sm overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/30">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                        Activity Log
                      </h3>
                  </div>

                  <div className="divide-y divide-slate-700">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="px-6 py-4 hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-white">
                            Micro-payment #{selectedSession.microPayments - i}
                          </p>
                          <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300 border border-green-500/30">
                            Confirmed
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          0.{Math.floor(Math.random() * 999)}1 USDC • ${(Math.random() * 0.005).toFixed(4)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
