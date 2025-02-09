import { createPublicClient, http, type PublicClient } from 'viem';
import { arbitrum, avalanche, base, bsc, mainnet, polygon } from 'viem/chains';

export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const avalancheClient = createPublicClient({
  chain: avalanche,
  transport: http(),
});

export const arbitrumClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
});

export const polygonClient = createPublicClient({
  chain: polygon,
  transport: http(),
});

export const bscClient = createPublicClient({
  chain: bsc,
  transport: http(),
});

export const supportedChains = [mainnet.id, base.id, avalanche.id, arbitrum.id, polygon.id, bsc.id];

export const viemClients = {
  [mainnet.id]: mainnetClient,
  [base.id]: baseClient,
  [avalanche.id]: avalancheClient,
  [arbitrum.id]: arbitrumClient,
  [polygon.id]: polygonClient,
  [bsc.id]: bscClient,
} as const;
