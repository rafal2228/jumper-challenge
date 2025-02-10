import { z } from 'zod';
import { commonValidations } from '../utils/commonValidation';
import { tokenSchema } from './token';

export const holdingSchemaDTO = z.object({
  address: commonValidations.address,
  token: tokenSchema,
  amount: z.coerce.string(),
});
