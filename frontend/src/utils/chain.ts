import { Address } from 'viem';
import { arbitrum, avalanche, base, bsc, mainnet, polygon } from 'viem/chains';

export const supportedChains = [mainnet.id, base.id, avalanche.id, arbitrum.id, polygon.id, bsc.id];

const blockExplorers = {
  [mainnet.id]: mainnet.blockExplorers.default.url,
  [base.id]: base.blockExplorers.default.url,
  [avalanche.id]: avalanche.blockExplorers.default.url,
  [arbitrum.id]: arbitrum.blockExplorers.default.url,
  [polygon.id]: polygon.blockExplorers.default.url,
  [bsc.id]: bsc.blockExplorers.default.url,
} as const;

export const getBlockExplorerUrl = (address: Address, chainId: number) => {
  return chainId in blockExplorers
    ? `${blockExplorers[chainId as keyof typeof blockExplorers]}/address/${address}`
    : null;
};

const names = {
  [mainnet.id]: mainnet.name,
  [base.id]: base.name,
  [avalanche.id]: avalanche.name,
  [arbitrum.id]: arbitrum.name,
  [polygon.id]: polygon.name,
  [bsc.id]: bsc.name,
} as const;

export const getChainName = (chainId: number) => {
  return chainId in names ? names[chainId as keyof typeof names] : null;
};
