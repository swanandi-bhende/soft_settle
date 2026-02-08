import Link from 'next/link';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  
  const isActive = (path: string) => router.pathname === path;

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Register', href: '/register' },
    { label: 'Monitor', href: '/monitor' },
  ];

  return (
    <header className="site-header fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-900/80 to-slate-900/20 backdrop-blur-md border-b border-slate-700/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="site-brand flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
            SS
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Soft-Settle
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="site-nav hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-all duration-200 relative ${
                isActive(link.href)
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  transition={{ duration: 0.3 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Wallet Connect Button */}
        <div className="flex items-center gap-4">
          <ConnectButton label="Connect" showBalance={false} />
        </div>
      </div>
    </header>
  );
}
