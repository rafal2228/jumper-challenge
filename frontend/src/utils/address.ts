import { Address } from 'viem';

export const formatAddress = (address: Address) =>
  `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
