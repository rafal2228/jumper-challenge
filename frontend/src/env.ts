import { z } from 'zod';

export const env = z
  .object({
    apiUrl: z.string().url(),
    walletConnectProjectId: z.string(),
  })
  .parse({
    apiUrl: process.env['NEXT_PUBLIC_API_URL'],
    walletConnectProjectId: process.env['NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'],
  });
