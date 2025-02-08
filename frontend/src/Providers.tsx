'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { PropsWithChildren } from 'react';
import { WagmiProvider } from 'wagmi';
import { config } from './wagmi';

const queryClient = new QueryClient();

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
