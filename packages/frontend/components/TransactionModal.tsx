// packages/frontend/components/TransactionModal.tsx
import { motion } from 'framer-motion';

export default function TransactionModal({ isOpen, status, txHash, onClose }: any) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border border-slate-600 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {status === 'pending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            {/* Spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mb-6 rounded-full border-4 border-slate-700 border-t-blue-500"
            />

            <h2 className="text-2xl font-bold text-white mb-2">Processing Transaction</h2>
            <p className="text-slate-400 text-sm">
              Please confirm the transaction in your wallet...
            </p>

            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-blue-300 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Awaiting signature
              </p>
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center"
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <circle cx="12" cy="12" r="11" stroke="#10B981" strokeWidth="1.5" fill="transparent" />
                <path d="M7 12.5l2.5 2.5L17 8" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            <h2 className="text-2xl font-bold text-green-400 mb-2">Transaction Confirmed!</h2>
            <p className="text-slate-400 text-sm mb-4">Your transaction has been successfully processed.</p>

            {txHash && (
              <div className="w-full mb-6 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Transaction Hash</p>
                <p className="text-sm font-mono text-slate-300 break-all">{txHash.slice(0, 20)}...</p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-medium hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-lg shadow-green-500/30"
            >
              Done
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center"
            >
              <span className="text-3xl">!</span>
            </motion.div>

            <h2 className="text-2xl font-bold text-red-400 mb-2">Transaction Failed</h2>
            <p className="text-slate-400 text-sm">Please try again or contact support if the issue persists.</p>

            <button
              onClick={onClose}
              className="w-full mt-6 py-3 px-6 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-500/30"
            >
              Close
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}