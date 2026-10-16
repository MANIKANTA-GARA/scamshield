import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle Payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'Request payload exceeds the maximum allowed limit of 50KB.',
    });
  }

  // Handle CORS error
  if (err.message === 'CORS origin unauthorized') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Cross-origin request blocked.',
    });
  }

  // Generic server error - NEVER leak stack trace in production
  console.error('[Internal Error]', err.message || err);
  return res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected security processing error occurred. Please try again.',
  });
}
