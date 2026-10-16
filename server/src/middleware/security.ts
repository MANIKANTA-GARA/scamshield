import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

export const helmetSecurity = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

export const corsSecurity = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, tests) or matching web client
    if (!origin || origin === config.clientUrl || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS origin unauthorized'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Middleware to prevent logging sensitive payload content
export function privacySafeLogger(req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  // DO NOT log req.body or any sensitive messages
  console.log(`[${timestamp}] ${req.method} ${req.path} (IP: ${req.ip || 'unknown'})`);
  next();
}
