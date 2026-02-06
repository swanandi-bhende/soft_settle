// pages/index.tsx

import { useState } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());
    } else {
      alert('Please install MetaMask or another Ethereum wallet.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      
      {/* Animated Title */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-7xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4"
      >
        Soft-Settle
      </motion.h1>

      {/* Subtitle */}
      <p className="mt-2 text-gray-400 text-xl text-center max-w-2xl">
        High-speed Micro-Credit Layer for AI Agents. Settle thousands of AI transactions for pennies.
      </p>

      {/* Wallet Connection */}
      <div className="mt-10">
        {!account ? (
          <button
            onClick={connectWallet}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-xl"
          >
            Connect Agent Wallet
          </button>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-green-500 font-mono">Connected: {account}</p>
            <a
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-black font-semibold hover:opacity-90 transition"
            >
              Enter Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
