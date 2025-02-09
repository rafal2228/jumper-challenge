import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ProtectedRoute, protectedRoute } from '@/common/middleware/protectedRoute';
import { holdingSchemaDTO } from '@/common/models/holding';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { commonValidations } from '@/common/utils/commonValidation';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import { supportedChains, viemClients } from '@/common/utils/viemClient';
import { db } from '@/db';
import { holdings, tokens } from '@/db/schema';
import { erc20Abi } from 'viem';

export const watchlistsRegistry = new OpenAPIRegistry();

export const watchlistsRouter = express.Router();

const bearerAuth = watchlistsRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

//#region GET /watchlists/:address

const watchlistsResponseSchema = z.object({
  holdings: z.array(holdingSchemaDTO),
});

type WatchlistsResponse = z.infer<typeof watchlistsResponseSchema>;

watchlistsRegistry.registerPath({
  method: 'get',
  path: '/watchlists/{address}',
  tags: ['Watchlists'],
  request: {
    params: z.object({
      address: commonValidations.address,
    }),
  },
  responses: createApiResponse(watchlistsResponseSchema, 'Success'),
});

watchlistsRouter.get(
  '/:address',
  validateRequest(z.object({ params: z.object({ address: commonValidations.address }) })),
  async (req: Request, res: Response) => {
    const { address } = req.params;

    const holdings = await db.query.holdings.findMany({
      where: (holding, { eq }) => eq(holding.address, address),
      with: {
        token: true,
      },
    });

    const serviceResponse = new ServiceResponse<WatchlistsResponse>(
      ResponseStatus.Success,
      'Nonce created successfully',
      watchlistsResponseSchema.parse({ holdings }),
      StatusCodes.OK,
    );

    handleServiceResponse(serviceResponse, res);
  },
);

//#endregion

//#region POST /watchlists/:address

const addWatchlistRequestBodySchema = z.object({
  tokenAddress: commonValidations.address,
  tokenChainId: z.number().int(),
});

const addWatchlistRequestParamsSchema = z.object({
  address: commonValidations.address,
});

const addWatchlistResponseSchema = holdingSchemaDTO;

type AddWatchlistRequest = Request<
  z.infer<typeof addWatchlistRequestParamsSchema>,
  z.infer<typeof addWatchlistResponseSchema>,
  z.infer<typeof addWatchlistRequestBodySchema>
>;

type AddWatchlistResponse = z.infer<typeof addWatchlistResponseSchema>;

watchlistsRegistry.registerPath({
  method: 'post',
  path: '/watchlists/{address}',
  tags: ['Watchlists'],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      address: commonValidations.address,
    }),
    body: {
      content: {
        'application/json': {
          schema: addWatchlistRequestBodySchema,
          example: {
            tokenAddress: '0xA0b73E1Ff7754A7895f4299869C56f9782495285',
            tokenChainId: 1,
          },
        },
      },
    },
  },
  responses: createApiResponse(addWatchlistResponseSchema, 'Success'),
});

watchlistsRouter.post(
  '/:address',
  protectedRoute,
  validateRequest(z.object({ body: addWatchlistRequestBodySchema, params: addWatchlistRequestParamsSchema })),
  async (req: AddWatchlistRequest, res: Response) => {
    if ((req as ProtectedRoute<AddWatchlistRequest>).user.address !== req.params.address) {
      const serviceResponse = new ServiceResponse<null>(
        ResponseStatus.Failed,
        'Forbidden',
        null,
        StatusCodes.FORBIDDEN,
      );

      return handleServiceResponse(serviceResponse, res);
    }

    const { tokenAddress } = req.body;
    const tokenChainId = req.body.tokenChainId as (typeof supportedChains)[number];

    if (!supportedChains.includes(tokenChainId)) {
      const serviceResponse = new ServiceResponse<null>(
        ResponseStatus.Failed,
        'Bad request',
        null,
        StatusCodes.BAD_REQUEST,
      );

      return handleServiceResponse(serviceResponse, res);
    }

    const publicClient = viemClients[tokenChainId];

    const createHolding = (tokenId: string, balance: bigint) =>
      db.insert(holdings).values({
        address: req.params.address,
        tokenId,
        amount: balance,
      });

    const existingToken = await db.query.tokens.findFirst({
      where: (token, { eq }) => eq(token.address, req.body.tokenAddress) && eq(token.chainId, req.body.tokenChainId),
      columns: {
        id: true,
      },
    });

    if (!existingToken?.id) {
      const [name, symbol, decimals, balance] = await publicClient.multicall({
        contracts: [
          {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'name',
          },
          {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'symbol',
          },
          {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'decimals',
          },
          {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [req.params.address],
          },
        ],
      });

      if (
        name.status !== 'success' ||
        symbol.status !== 'success' ||
        decimals.status !== 'success' ||
        balance.status !== 'success'
      ) {
        const serviceResponse = new ServiceResponse<null>(
          ResponseStatus.Failed,
          `Unable to load token details. Are you sure it's a valid token address?`,
          null,
          StatusCodes.BAD_REQUEST,
        );

        return handleServiceResponse(serviceResponse, res);
      }

      const createdToken = await db
        .insert(tokens)
        .values({
          address: tokenAddress as string,
          chainId: tokenChainId,
          decimals: decimals.result,
          name: name.result,
          symbol: symbol.result,
        })
        .returning({
          id: tokens.id,
        });

      const tokenId = createdToken[0].id;

      const holding = await createHolding(tokenId, balance.result);

      const serviceResponse = new ServiceResponse<AddWatchlistResponse>(
        ResponseStatus.Success,
        'Nonce created successfully',
        addWatchlistResponseSchema.parse({ holding }),
        StatusCodes.OK,
      );

      return handleServiceResponse(serviceResponse, res);
    }

    const existingHolding = await db.query.holdings.findFirst({
      where: (holding, { eq }) => eq(holding.address, req.params.address) && eq(holding.tokenId, existingToken.id),
      with: {
        token: true,
      },
    });

    if (existingHolding) {
      const serviceResponse = new ServiceResponse<null>(ResponseStatus.Failed, 'Conflict', null, StatusCodes.CONFLICT);

      return handleServiceResponse(serviceResponse, res);
    }

    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [req.params.address],
    });

    const holding = await createHolding(existingToken.id, balance);

    const serviceResponse = new ServiceResponse<AddWatchlistResponse>(
      ResponseStatus.Success,
      'Nonce created successfully',
      addWatchlistResponseSchema.parse({ holding }),
      StatusCodes.OK,
    );

    handleServiceResponse(serviceResponse, res);
  },
);
