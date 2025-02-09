import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Address } from 'viem';

import { verifyToken } from '@/api/auth/services/auth';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

export type ProtectedRoute<R extends Request> = R & {
  user: { address: Address };
};

export const protectedRoute = () => (req: ProtectedRoute<Request>, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      throw new Error('Unauthorized');
    }

    const decodedToken = verifyToken(accessToken);
    req.user = decodedToken;

    next();
  } catch (err) {
    const statusCode = StatusCodes.UNAUTHORIZED;
    res.status(statusCode).send(new ServiceResponse<null>(ResponseStatus.Failed, 'Unauthorized', null, statusCode));
  }
};
