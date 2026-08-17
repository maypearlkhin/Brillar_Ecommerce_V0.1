import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';
  return sendError(res, message, 500);
};

export const notFoundHandler = (_req: Request, res: Response) => {
  return sendError(res, 'Resource not found', 404);
};
