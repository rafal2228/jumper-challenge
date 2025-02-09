'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { PropsWithChildren } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { arbitrum, avalanche, base, bsc, mainnet, polygon } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';
import { AuthProvider } from './auth';
import { env } from './env';

const config = createConfig({
  ssr: true,
  multiInjectedProviderDiscovery: true,
  chains: [mainnet, base, avalanche, arbitrum, polygon, bsc],
  connectors: [
    walletConnect({
      projectId: env.walletConnectProjectId,
      qrModalOptions: {
        themeVariables: {
          '--wcm-z-index': '1500',
        },
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [avalanche.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
});

const queryClient = new QueryClient();

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider maxSnack={3}>
          <AuthProvider>{children}</AuthProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
