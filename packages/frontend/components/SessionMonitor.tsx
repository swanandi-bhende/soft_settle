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
    <div className="p-8 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700">
      <div className="flex justify-between mb-4 text-base text-gray-300">
        <span>Credit Usage</span>
        <span>{progress.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div 
          className="bg-blue-500 h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="mt-6 text-sm text-gray-400">Session ID: {sessionData.sessionId}</p>
    </div>
  );
}