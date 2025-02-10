import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifySiweMessage } from 'viem/siwe';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { commonValidations } from '@/common/utils/commonValidation';
import { env } from '@/common/utils/envConfig';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import { mainnetClient } from '@/common/utils/viemClient';
import { generateAccessToken, generateRefreshToken, verifyToken } from './services/auth';
import { createNonce, deleteNonce, NONCE_TIMEOUT, validateNonce } from './services/nonce';

export const authRegistry = new OpenAPIRegistry();

export const authRouter = express.Router();

//#region Nonce

const nonceResponseSchema = z.object({
  nonce: z.string(),
});

type NonceResponse = z.infer<typeof nonceResponseSchema>;

const nonceRequestBodySchema = z.object({
  address: commonValidations.address,
});

type NonceRequest = Request<{}, NonceResponse, z.infer<typeof nonceRequestBodySchema>>;

authRegistry.registerPath({
  method: 'post',
  path: '/auth/nonce',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      description: `Body with address to create nonce for.
      This nonce will be used to verify the signature of the SIWE message.
      Nonce is valid for ${NONCE_TIMEOUT} seconds, can be used only once and
      account can only use the latest one generated.`,
      content: {
        'application/json': {
          schema: nonceRequestBodySchema,
          example: {
            address: '0x1234567890123456789012345678901234567890',
          },
        },
      },
    },
  },
  responses: createApiResponse(nonceResponseSchema, 'Success'),
});

authRouter.post(
  '/nonce',
  validateRequest(z.object({ body: nonceRequestBodySchema })),
  async (req: NonceRequest, res: Response) => {
    const nonce = await createNonce(req.body.address);

    const serviceResponse = new ServiceResponse<NonceResponse>(
      ResponseStatus.Success,
      'Nonce created successfully',
      { nonce },
      StatusCodes.OK,
    );

    handleServiceResponse(serviceResponse, res);
  },
);

//#endregion

//#region Verify

const verifyResponseSchema = z.object({
  accessToken: z.string(),
});

type VerifyResponse = z.infer<typeof verifyResponseSchema>;

const verifyRequestBodySchema = z.object({
  signature: commonValidations.signature,
  message: z.string(),
  address: commonValidations.address,
  nonce: z.string(),
});

type VerifyRequest = Request<{}, VerifyResponse, z.infer<typeof verifyRequestBodySchema>>;

authRegistry.registerPath({
  method: 'post',
  path: '/auth/verify',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      description: 'Body with SIWE message and signature to verify.',
      content: {
        'application/json': {
          schema: verifyRequestBodySchema,
          example: {
            signature:
              '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c',
            message: 'SWIE message similar to: jumper.com wants you to sign in with your Ethereum account...',
          },
        },
      },
    },
  },
  responses: createApiResponse(verifyResponseSchema, 'Success'),
});

authRouter.post(
  '/verify',
  validateRequest(z.object({ body: verifyRequestBodySchema })),
  async (req: VerifyRequest, res: Response) => {
    const { body } = req;
    const isValidNonce = await validateNonce(body.address, body.nonce);

    if (!isValidNonce) {
      const serviceResponse = new ServiceResponse<null>(
        ResponseStatus.Failed,
        'Bad request',
        null,
        StatusCodes.BAD_REQUEST,
      );

      return handleServiceResponse(serviceResponse, res);
    }

    try {
      const isValidSignature = await verifySiweMessage(mainnetClient, {
        message: body.message,
        signature: body.signature,
        address: body.address,
        nonce: body.nonce,
      });

      if (!isValidSignature) {
        const serviceResponse = new ServiceResponse<null>(
          ResponseStatus.Failed,
          'Bad request',
          null,
          StatusCodes.BAD_REQUEST,
        );

        return handleServiceResponse(serviceResponse, res);
      }
    } catch (error) {
      const serviceResponse = new ServiceResponse<null>(
        ResponseStatus.Failed,
        'Bad request',
        null,
        StatusCodes.BAD_REQUEST,
      );

      return handleServiceResponse(serviceResponse, res);
    }

    await deleteNonce(body.address);

    const accessToken = generateAccessToken(body.address);
    const refreshToken = generateRefreshToken(body.address);

    res.cookie(env.AUTH_REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      path: '/auth/refresh',
      secure: env.isProduction,
    });

    const serviceResponse = new ServiceResponse<VerifyResponse>(
      ResponseStatus.Success,
      'Access granted',
      { accessToken },
      StatusCodes.OK,
    );

    handleServiceResponse(serviceResponse, res);
  },
);

//#endregion

//#region Refresh

const refreshResponseSchema = z.object({
  accessToken: z.string(),
});

type RefreshResponse = z.infer<typeof refreshResponseSchema>;

authRegistry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  tags: ['Auth'],
  responses: createApiResponse(refreshResponseSchema, 'Success'),
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[env.AUTH_REFRESH_TOKEN_COOKIE_NAME];

  if (!refreshToken || typeof refreshToken !== 'string') {
    const serviceResponse = new ServiceResponse<null>(
      ResponseStatus.Failed,
      'Bad request',
      null,
      StatusCodes.BAD_REQUEST,
    );

    return handleServiceResponse(serviceResponse, res);
  }

  try {
    const decodedToken = verifyToken(refreshToken);
    const accessToken = generateAccessToken(decodedToken.address);

    const serviceResponse = new ServiceResponse<RefreshResponse>(
      ResponseStatus.Success,
      'Access granted',
      { accessToken },
      StatusCodes.OK,
    );

    handleServiceResponse(serviceResponse, res);
  } catch (error) {
    const serviceResponse = new ServiceResponse<null>(
      ResponseStatus.Failed,
      'Bad request',
      null,
      StatusCodes.BAD_REQUEST,
    );

    return handleServiceResponse(serviceResponse, res);
  }
});

//#endregion
