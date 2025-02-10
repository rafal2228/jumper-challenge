import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { generateKeyPairSync } from 'node:crypto';
import { vi } from 'vitest';
import { z } from 'zod';

extendZodWithOpenApi(z);

const keypair = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

vi.stubEnv('AUTH_PRIVATE_KEY', keypair.privateKey);
vi.stubEnv('AUTH_PUBLIC_KEY', keypair.publicKey);

vi.mock('iovalkey');
