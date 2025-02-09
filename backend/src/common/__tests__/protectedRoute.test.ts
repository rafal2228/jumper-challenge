import express from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { generateAccessToken } from '@/api/auth/services/auth';
import { protectedRoute } from '@/common/middleware/protectedRoute';

describe('Protected Route Middleware', () => {
  const app = express();

  beforeAll(() => {
    app.get('/protected', protectedRoute, (_req, res) => res.status(StatusCodes.OK).send('Success'));
  });

  it('rejects requests without a token', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('rejects requests with invalid token', async () => {
    const response = await request(app).get('/protected').set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('accepts requests with valid token', async () => {
    const accessToken = generateAccessToken('0x1234567890abcdef1234567890abcdef12345678');

    const response = await request(app).get('/protected').set('Authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(StatusCodes.OK);
  });
});
