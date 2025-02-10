import axios from 'axios';
import { Address, Hex, hexToBigInt } from 'viem';
import { arbitrum, avalanche, base, bsc, mainnet, polygon } from 'viem/chains';
import { env } from './envConfig';

const supportedChains = [mainnet.id, base.id, avalanche.id, arbitrum.id, polygon.id, bsc.id];

const http = axios.create({
  baseURL: `https://eth-mainnet.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`,
});

const parseBalance = (balance: Hex) => {
  try {
    return hexToBigInt(balance).toString();
  } catch (error) {
    return '0';
  }
};

export const exploreTokens = async (address: Address, chainId: number) => {
  if (!supportedChains.includes(chainId as (typeof supportedChains)[number])) {
    return [];
  }

  const data = {
    jsonrpc: '2.0',
    method: 'alchemy_getTokenBalances',
    headers: {
      'Content-Type': 'application/json',
    },
    params: [address, 'erc20'],
    id: chainId,
  };

  const response = await http.post<{
    result: { tokenBalances: Array<{ contractAddress: Address; tokenBalance: Hex }> };
  }>('', data);

  const tokens = response.data.result.tokenBalances.map((token) => ({
    address: token.contractAddress,
    balance: parseBalance(token.tokenBalance),
  }));

  return tokens;
};
