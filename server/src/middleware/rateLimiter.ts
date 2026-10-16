import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please wait a moment before trying again.',
    retryAfterSeconds: Math.ceil(config.rateLimitWindowMs / 1000),
  },
});
