// packages/frontend/components/SessionLiveFeed.tsx
'use client';

import { gql } from '@apollo/client';
import { useSubscription } from '@apollo/client/react';
import { motion } from 'framer-motion';

const SESSION_UPDATED = gql`
  subscription OnSessionUpdated($sessionId: String!) {
    sessionUpdated(sessionId: $sessionId) {
      id
      balance
      status
      nonce
    }
  }
`;

interface SessionUpdatedData {
  sessionUpdated: {
    id: string;
    balance: number;
    status: 'active' | 'closed' | 'disputed';
    nonce: number;
  };
}

interface SessionLiveFeedProps {
  sessionId: string;
}

export default function SessionLiveFeed({
  sessionId,
}: SessionLiveFeedProps) {
  const { data, loading } = useSubscription<SessionUpdatedData>(
    SESSION_UPDATED,
    {
      variables: { sessionId },
      skip: !sessionId,
    }
  );

  if (loading) {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="p-6 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700 backdrop-blur-sm flex items-center gap-3 text-slate-400"
      >
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-sm">Connecting to live relay...</span>
      </motion.div>
    );
  }

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700 backdrop-blur-sm flex items-center gap-3 text-slate-400"
      >
        <span className="text-sm">Waiting for session events...</span>
      </motion.div>
    );
  }

  const { balance, status, nonce } = data.sessionUpdated;

  const statusColors = {
    active: 'from-green-500/20 to-green-600/20 text-green-300 border-green-500/30',
    closed: 'from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30',
    disputed: 'from-red-500/20 to-red-600/20 text-red-300 border-red-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl bg-gradient-to-br ${statusColors[status]} border backdrop-blur-sm`}
    >
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/30 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Status</p>
          <p className="text-lg font-bold text-white capitalize">{status}</p>
        </div>
        <div className="bg-slate-900/30 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Nonce</p>
          <p className="text-lg font-bold text-white font-mono">{nonce}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2">Accumulated Balance</p>
        <p className="text-3xl font-bold text-white font-mono mb-3">
          {balance} <span className="text-sm text-slate-400">USDC</span>
        </p>

        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((balance / 10) * 100, 100)}%` }}
            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <p className="text-xs text-slate-500 font-mono">
        Updates: {nonce} micro-transactions processed
      </p>
    </motion.div>
  );
}