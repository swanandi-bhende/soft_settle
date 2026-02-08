/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js to compile these specific packages 
  // so they work correctly with the browser and server.
  transpilePackages: [
    '@wagmi',
    'wagmi',
    '@reown/appkit',
    '@walletconnect',
    '@metamask/sdk',
    '@rainbow-me/rainbowkit'
  ],

  webpack: (config) => {
    config.externals.push({ 'pino-pretty': 'pino-pretty', 'lokijs': 'lokijs', 'encoding': 'encoding' });
    return config;
  },
};

export default nextConfig;