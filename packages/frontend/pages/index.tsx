import { useState } from 'react';
import { ethers } from 'ethers';

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
        Soft-Settle
      </h1>
      <p className="text-gray-600 text-xl mb-10 text-center max-w-2xl">
        The High-Speed Micro-Credit Layer for Agentic Commerce. 
        Settle thousands of AI transactions for pennies.
      </p>

      {!account ? (
        <button 
          onClick={connectWallet}
          className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-xl"
        >
          Connect Agent Wallet
        </button>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-green-600 font-mono">Connected: {account}</p>
          <a href="/dashboard" className="text-blue-600 underline">Enter Dashboard</a>
        </div>
      )}
    </div>
  );
}