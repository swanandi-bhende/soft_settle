import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client/react';
import { client } from '../lib/apollo'; // Your Apollo Client setup
import { WagmiConfig, createConfig, mainnet } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const { chains, publicClient } = getDefaultWallets({
  appName: 'Soft-Settle',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet],
});

const config = createConfig({
  autoConnect: true,
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