// packages/frontend/pages/index.tsx
"use client";
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import Header from '../components/Header';

const fadeInUp = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center justify-center gap-2 mb-8 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-300">Live on Polygon</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-6xl sm:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                AI Micro-Credit
              </span>
              <br />
              <span className="text-slate-100">at Lightning Speed</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-300 max-w-2xl mx-auto mb-12"
            >
              Settle thousands of AI agent transactions for pennies. A trust tunnel for autonomous commerce.
            </motion.p>

            {/* CTA Section */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {!isConnected ? (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <ConnectButton label="Connect Wallet" showBalance={false} />
                  <span className="text-slate-400">or</span>
                  <Link
                    href="/register"
                    className="px-8 py-3 rounded-lg font-medium text-white border border-slate-600 hover:border-blue-400 hover:bg-blue-400/5 transition-all duration-300"
                  >
                    Learn More
                  </Link>
                </div>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                >
                  Go to Dashboard
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
          >
            {[
              { label: 'Sub-cent Tx Costs', value: '$0.001' },
              { label: 'Concurrent Sessions', value: '1000+' },
              { label: 'Settlement Time', value: '< 100ms' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 text-center group"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20"
          >
            {[
              {
                title: 'ENS Integration',
                description: 'Agent identity & reputation on Ethereum Name Service',
              },
              {
                title: 'Yellow Network',
                description: 'State channels for off-chain micro-transactions',
              },
              {
                title: 'Circle Settlement',
                description: 'Instant USDC settlement and payouts',
              },
              {
                title: 'Real-time Monitor',
                description: 'Live dashboard for agent oversight and analytics',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group"
              >
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Integration Partners */}
          <motion.div
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-2xl font-bold text-white mb-8">Powered By</h2>
            <div className="flex justify-center gap-8 flex-wrap">
              {['Polygon', 'Yellow Network', 'Circle', 'ENS'].map((partner, i) => (
                <div
                  key={i}
                  className="px-6 py-3 rounded-lg bg-slate-800/30 border border-slate-700/30 text-slate-300 font-medium text-sm"
                >
                  {partner}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/30 bg-slate-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2026 Soft-Settle. Enabling autonomous commerce for the AI era.</p>
        </div>
      </footer>
    </div>
  );
}