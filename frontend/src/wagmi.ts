import { createConfig, http } from 'wagmi';
import { arbitrum, avalanche, base, bsc, mainnet, polygon } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';
import { env } from './env';

export const config = createConfig({
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
