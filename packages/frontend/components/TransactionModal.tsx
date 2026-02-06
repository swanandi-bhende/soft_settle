import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionModal({ isOpen, status, txHash }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl"
      >
        {status === 'pending' && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
            <h2 className="text-xl font-bold">Processing Signature</h2>
            <p className="text-gray-500 mt-2">Please confirm in your wallet...</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold">Success!</h2>
            <p className="text-gray-500 mt-2">Transaction Hash: {txHash.slice(0, 10)}...</p>
            <button className="mt-6 w-full py-2 bg-blue-600 text-white rounded-xl">Done</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}