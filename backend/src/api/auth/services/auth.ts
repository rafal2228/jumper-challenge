import { env } from '@/common/utils/envConfig';
import { sign, verify } from 'jsonwebtoken';
import { Address, isAddress } from 'viem';

export const generateAccessToken = (address: Address) => {
  return sign({ address }, env.AUTH_PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '15m' });
};

export const generateRefreshToken = (address: Address) => {
  return sign({ address }, env.AUTH_PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '7d' });
};

export const verifyToken = (token: string): { address: Address } => {
  const payload = verify(token, env.AUTH_PUBLIC_KEY);

  if (typeof payload !== 'object' || !('address' in payload) || !isAddress(payload.address)) {
    throw new Error('Invalid token');
  }

  return { address: payload.address };
};
