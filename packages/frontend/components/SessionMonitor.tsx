// packages/frontend/components/SessionMonitor.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function SessionMonitor({ sessionData }: { sessionData: any }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const percentage = (sessionData.currentBalance / sessionData.deposit) * 100;
    setProgress(percentage > 100 ? 100 : percentage);
  }, [sessionData]);

  return (
    <motion.div 
      whileHover={{ translateY: -2 }}
      className="p-6 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          Credit Usage
        </span>
        <span className="text-sm font-semibold text-white font-mono">{progress.toFixed(1)}%</span>
      </div>

      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
        <motion.div 
          className="h-full bg-gradient-to-r from-green-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-slate-700">
        <div>
          <p className="text-xs text-slate-500 mb-1">Deposit</p>
          <p className="text-lg font-semibold text-white">${sessionData.deposit}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Used</p>
          <p className="text-lg font-semibold text-white">${sessionData.currentBalance}</p>
        </div>
      </div>

      <p className="text-xs text-slate-500 font-mono">
        Session ID: {sessionData.sessionId?.slice(0, 16)}...
      </p>
    </motion.div>
  );
}