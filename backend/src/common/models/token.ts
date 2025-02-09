import { z } from 'zod';
import { commonValidations } from '../utils/commonValidation';

export const tokenSchema = z.object({
  address: commonValidations.address,
  chainId: z.number().int(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number().int(),
  logoUrl: z.string().nullable(),
});
