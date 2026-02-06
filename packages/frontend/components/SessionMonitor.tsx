import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function SessionMonitor({ sessionData }: { sessionData: any }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate how much of the deposit is used
    const percentage = (sessionData.currentBalance / sessionData.deposit) * 100;
    setProgress(percentage > 100 ? 100 : percentage);
  }, [sessionData]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Credit Usage</span>
        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{progress.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <motion.div 
          className="bg-blue-600 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="mt-4 text-xs text-gray-500">Session ID: {sessionData.sessionId}</p>
    </div>
  );
}