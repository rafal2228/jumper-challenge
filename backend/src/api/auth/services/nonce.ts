import { env } from '@/common/utils/envConfig';
import Valkey from 'iovalkey';
import { Address } from 'viem';
import { generateSiweNonce } from 'viem/siwe';

const valkey = new Valkey(env.VALKEY_PORT, env.VALKEY_HOST);

// TTL in seconds
export const NONCE_TIMEOUT = 60 * 60;

const getKey = (address: Address) => `nonce_${address}`;

export const validateNonce = async (address: Address, nonce: string) => {
  const storedNonce = await valkey.get(getKey(address));

  if (!storedNonce) {
    return false;
  }

  return storedNonce === nonce;
};

export const createNonce = async (address: Address) => {
  const nonce = generateSiweNonce();

  await valkey.set(getKey(address), nonce, 'EX', NONCE_TIMEOUT);

  return nonce;
};

export const deleteNonce = async (address: Address) => {
  await valkey.del(getKey(address));
};
