import { Address } from 'viem';
import { z } from 'zod';

export const commonValidations = {
  id: z
    .string()
    .refine((data) => !isNaN(Number(data)), 'ID must be a numeric value')
    .transform(Number)
    .refine((num) => num > 0, 'ID must be a positive number'),
  address: z.string().startsWith('0x').length(42) as z.ZodSchema<Address>,
  signature: z.string().startsWith('0x') as z.ZodSchema<`0x${string}`>,
};
