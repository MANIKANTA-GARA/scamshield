import express from 'express';
import { config } from './config.js';
import { helmetSecurity, corsSecurity, privacySafeLogger } from './middleware/security.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { messageRouter } from './routes/message.js';
import { urlRouter } from './routes/url.js';
import { otpRouter } from './routes/otp.js';
import { transactionRouter } from './routes/transaction.js';
import { shareRouter } from './routes/share.js';
import { healthRouter } from './routes/health.js';
import { eventsRouter } from './routes/events.js';
import { sourcesRouter } from './routes/sources.js';

const app = express();

// Security Headers
app.use(helmetSecurity);

// Privacy-safe request logging (omits user content)
app.use(privacySafeLogger);

// CORS configuration
app.use(corsSecurity);

// Body Parsing with strict size limits (50kb max to prevent DoS)
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Apply rate limiting to all /api routes
app.use('/api', apiRateLimiter);

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/events', eventsRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/scan/message', messageRouter);
app.use('/api/scan/url', urlRouter);
app.use('/api/scan/otp', otpRouter);
app.use('/api/scan/transaction', transactionRouter);
app.use('/api/share-target', shareRouter);

// Centralized safe error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🛡️ ScamShield AI Backend running on port ${config.port} [${config.nodeEnv}]`);
  console.log(`🔒 Gemini AI Configured: ${Boolean(config.geminiApiKey && config.geminiApiKey !== 'YOUR_GEMINI_API_KEY')}`);
  console.log(`📲 PWA Share Target endpoint: /api/share-target`);
});
