import axios from 'axios';
import { Address, parseUnits } from 'viem';
import { arbitrum, avalanche, base, bsc, mainnet, polygon } from 'viem/chains';
import { env } from './envConfig';

const http = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
});

export const PRICE_DECIMALS = 18;

export const assetNames = {
  [mainnet.id]: 'ethereum',
  [base.id]: 'base',
  [avalanche.id]: 'avalanche',
  [arbitrum.id]: 'arbitrum-one',
  [polygon.id]: 'polygon-pos',
  [bsc.id]: 'binance-smart-chain',
} as const;

export const getLatestTokensPrice = async (tokenAddresses: Address[], tokenChainId: number) => {
  const assetName = assetNames[tokenChainId as keyof typeof assetNames];

  if (!assetName) {
    throw new Error(`Unsupported chain id: ${tokenChainId}`);
  }

  const response = await http.get<Record<string, { usd: number }>>(`/simple/token_price/${assetName}`, {
    params: {
      contract_addresses: tokenAddresses.join(','),
      vs_currencies: 'usd',
    },
    headers: {
      'x-cg-api-key': env.COINGECKO_API_KEY,
    },
  });

  return tokenAddresses.reduce(
    (acc, address) => {
      const price = response.data[address.toLowerCase()]?.usd ?? 0;

      acc[address] = parseUnits(price.toString(), PRICE_DECIMALS);

      return acc;
    },
    {} as Record<Address, bigint>,
  );
};
