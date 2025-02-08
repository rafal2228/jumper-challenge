import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as baseRender, RenderOptions } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { PropsWithChildren, ReactElement } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { mock } from 'wagmi/connectors';

export * from '@testing-library/react';

const queryClient = new QueryClient();

const config = createConfig({
  ssr: true,
  multiInjectedProviderDiscovery: true,
  chains: [mainnet],
  connectors: [
    mock({
      accounts: ['0x1234567890123456789012345678901234567890'],
    }),
  ],
  transports: {
    [mainnet.id]: http(),
  },
});

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const render = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  baseRender(ui, { wrapper: Providers, ...options });
