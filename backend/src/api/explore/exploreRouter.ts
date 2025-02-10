import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { commonValidations } from '@/common/utils/commonValidation';
import { exploreTokens } from '@/common/utils/exploreToken';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const exploreRegistry = new OpenAPIRegistry();

export const exploreRouter = express.Router();

const exploreRequestBodySchema = z.object({
  address: commonValidations.address,
  chainId: z.number().int(),
});

const exploreResponseSchema = z.object({
  tokens: z.array(
    z.object({
      address: commonValidations.address,
      balance: z.string(),
    }),
  ),
});

type ExploreRequest = Request<{}, z.infer<typeof exploreResponseSchema>, z.infer<typeof exploreRequestBodySchema>>;

type ExploreResponse = z.infer<typeof exploreResponseSchema>;

exploreRegistry.registerPath({
  method: 'post',
  path: '/explore',
  tags: ['Explore'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: exploreRequestBodySchema,
          example: {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 1,
          },
        },
      },
    },
  },
  responses: createApiResponse(exploreResponseSchema, 'Success'),
});

exploreRouter.post(
  '',
  validateRequest(z.object({ body: exploreRequestBodySchema })),
  async (req: ExploreRequest, res: Response) => {
    const { address, chainId } = req.body;

    try {
      const tokens = await exploreTokens(address, chainId);

      const serviceResponse = new ServiceResponse<ExploreResponse>(
        ResponseStatus.Success,
        'Tokens fetched successfully',
        exploreResponseSchema.parse({ tokens }),
        StatusCodes.OK,
      );

      handleServiceResponse(serviceResponse, res);
    } catch {
      const serviceResponse = new ServiceResponse<null>(
        ResponseStatus.Failed,
        'Unable to load erc20 tokens list',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );

      return handleServiceResponse(serviceResponse, res);
    }
  },
);
