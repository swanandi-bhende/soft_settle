import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { ApolloProvider } from '@apollo/client/react';
import { client } from '../lib/apollo';

import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import {
  RainbowKitProvider,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// 1️⃣ Configure chains
const { chains, publicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

// 2️⃣ Get wallet connectors
const { connectors } = getDefaultWallets({
  appName: 'Soft-Settle',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains,
});

// 3️⃣ Create wagmi config (v2 style)
const config = createConfig({
  connectors,
  publicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
        <ApolloProvider client={client}>
          <Component {...pageProps} />
        </ApolloProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
