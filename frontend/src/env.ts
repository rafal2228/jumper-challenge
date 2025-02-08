import { z } from 'zod';

export const env = z
  .object({
    walletConnectProjectId: z.string(),
  })
  .parse({
    walletConnectProjectId: process.env['NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'],
  });
