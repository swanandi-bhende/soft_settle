// packages/frontend/pages/index.tsx
"use client";
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-7xl font-bold mb-6"
      >
        Soft-Settle
      </motion.h1>

      <p className="text-xl text-gray-300 text-center max-w-3xl mb-12 px-4">
        High-speed Micro-Credit Layer for AI Agents. Settle thousands of transactions for pennies.
      </p>

      <div className="p-8 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700 max-w-md w-full">
        {!isConnected ? (
          <div className="flex flex-col items-center gap-6">
             <p className="text-sm text-gray-400 uppercase tracking-wider">Authorize Agent</p>
             <ConnectButton label="Connect MetaMask" showBalance={false} />
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-6 text-green-400 font-mono text-base">
              Vault Active: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <Link 
              href="/dashboard"
              className="px-12 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition duration-300"
            >
              Enter Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}