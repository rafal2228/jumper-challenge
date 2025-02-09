import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import Valkey from 'iovalkey';

import { ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';
import { env } from '@/common/utils/envConfig';
import { generateRefreshToken } from '../services/auth';

const valkey = new Valkey();

const mockNonce = async (address: string, nonce: string | null) => {
  if (nonce) {
    valkey.set(`nonce_${address}`, nonce);
  } else {
    valkey.del(`nonce_${address}`);
  }
};

const validAddress = '0x78f080A478F27515a858a296E747eFEc84758789';
const validSignature =
  '0xff92a0924d9530ca87c4fc04d921434278b7254ca65b0881e32c03aba470a1c43614efb5aa2275433a124d9a657dd89690ec97368770bfa138d07b4569fe4e051b';
const validNonce = 'b20bd6c0ca7181d70a187aa6777f4823375651a663df5d2bc3a68afc4bb3339ea6474d49824f8d97a760e31823a7e578';
const validMessage = `localhost wants you to sign in with your Ethereum account:
0x78f080A478F27515a858a296E747eFEc84758789


URI: http://localhost:3000/
Version: 1
Chain ID: 8453
Nonce: b20bd6c0ca7181d70a187aa6777f4823375651a663df5d2bc3a68afc4bb3339ea6474d49824f8d97a760e31823a7e578
Issued At: 2025-02-09T12:15:40.035Z`;

describe('Auth API', () => {
  describe('POST /auth/nonce', () => {
    it('rejects user with invalid address', async () => {
      const response = await request(app).post('/auth/nonce').send({
        address: 'not an address',
      });
      const result: ServiceResponse = response.body;

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.responseObject).toBeNull();
      expect(result.message).toMatch(/Invalid input/);
    });

    it('creates nonce as non-empty random string', async () => {
      const response = await request(app).post('/auth/nonce').send({
        address: '0x1234567890123456789012345678901234567890',
      });
      const result: ServiceResponse = response.body;

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.responseObject).toEqual(expect.objectContaining({ nonce: expect.stringMatching(/.+/) }));
      expect(result.message).toEqual('Nonce created successfully');
    });
  });

  describe('POST /auth/verify', () => {
    it('rejects verification call with invalid body', async () => {
      const response = await request(app).post('/auth/verify').send({
        notSignature: true,
      });
      const result: ServiceResponse = response.body;

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.responseObject).toBeNull();
      expect(result.message).toMatch(/Invalid input/);
    });

    it('rejects verification call with invalid signature', async () => {
      const nonce = validNonce;
      const address = validAddress;
      const signature = '0x25invalid';
      const message = validMessage;

      await mockNonce(address, nonce);

      const response = await request(app).post('/auth/verify').send({ signature, message, address, nonce });
      const result: ServiceResponse = response.body;

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.responseObject).toBeNull();
      expect(result.message).toMatch('Bad request');
    });

    it('creates access token, sets refresh token cookie and removes nonce from valkey', async () => {
      const nonce = validNonce;
      const address = validAddress;
      const signature = validSignature;
      const message = validMessage;

      await mockNonce(address, nonce);

      const response = await request(app).post('/auth/verify').send({ signature, message, address, nonce });
      const result: ServiceResponse = response.body;

      // Response
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.responseObject).toEqual(expect.objectContaining({ accessToken: expect.stringMatching(/.+/) }));
      expect(result.message).toEqual('Access granted');

      // Refresh token
      expect(response.header['set-cookie'].at(0)).toMatch(new RegExp(`${env.AUTH_REFRESH_TOKEN_COOKIE_NAME}=.*;`));

      // Nonce
      expect(await valkey.get(`nonce_${address}`)).toBeFalsy();
    });
  });

  describe('POST /auth/refresh', () => {
    it('rejects refresh call with missing cookie', async () => {
      const response = await request(app).post('/auth/refresh');
      const result: ServiceResponse = response.body;

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.responseObject).toBeNull();
      expect(result.message).toMatch(/Bad request/);
    });

    it('rejects refresh call with invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', `${env.AUTH_REFRESH_TOKEN_COOKIE_NAME}=not-a-refresh-token`);
      const result: ServiceResponse = response.body;

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.responseObject).toBeNull();
      expect(result.message).toMatch(/Bad request/);
    });

    it('refreshes access token', async () => {
      const refreshToken = generateRefreshToken('0x1234567890abcdef1234567890abcdef12345678');

      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', `${env.AUTH_REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`);
      const result: ServiceResponse = response.body;

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.responseObject).toEqual(expect.objectContaining({ accessToken: expect.stringMatching(/.+/) }));
      expect(result.message).toEqual('Access granted');
    });
  });
});
