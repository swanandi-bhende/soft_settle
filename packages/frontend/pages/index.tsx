// packages/frontend/pages/index.tsx
"use client";
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white selection:bg-blue-500">
      
      {/* Animated Title */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-7xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent mb-4"
      >
        Soft-Settle
      </motion.h1>

      <p className="mt-2 text-gray-400 text-xl text-center max-w-2xl font-light">
        High-speed <span className="text-blue-400">Micro-Credit</span> Layer for AI Agents. 
        Settle thousands of transactions for pennies.
      </p>

      {/* Wallet Connection Section */}
      <div className="mt-12 p-6 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
        {!isConnected ? (
          <div className="flex flex-col items-center gap-4">
             <p className="text-sm text-gray-500 uppercase tracking-widest">Authorize Agent</p>
             <ConnectButton label="Connect MetaMask" showBalance={false} />
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-6 text-green-400 font-mono text-sm">
              Vault Active: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <Link 
              href="/dashboard"
              className="px-10 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform inline-block"
            >
              Enter Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}