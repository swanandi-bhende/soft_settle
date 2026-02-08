// packages/frontend/components/TransactionModal.tsx
import { motion } from 'framer-motion';

export default function TransactionModal({ isOpen, status, txHash }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800 p-10 rounded-2xl max-w-md w-full text-center shadow-2xl border border-gray-700"
      >
        {status === 'pending' && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-6" />
            <h2 className="text-2xl font-bold text-white">Processing Signature</h2>
            <p className="text-gray-300 mt-3">Please confirm in your wallet...</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <div className="text-6xl mb-6 text-green-400">✓</div>
            <h2 className="text-2xl font-bold text-white">Success!</h2>
            <p className="text-gray-300 mt-3">Transaction Hash: {txHash.slice(0, 10)}...</p>
            <button className="mt-8 w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-300 font-medium">Done</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}