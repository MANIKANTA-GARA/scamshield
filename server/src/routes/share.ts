import { Router } from 'express';
import { ShareTargetFormSchema } from '../schemas/index.js';
import { config } from '../config.js';
import { redactSensitiveData } from '../services/redaction.js';

export const shareRouter = Router();

/**
 * Android PWA Web Share Target Handler
 * Receives shared text/URL via POST (from PWA manifest action) or GET.
 * Does NOT auto-visit URLs or auto-execute scans.
 * Redirects securely to the client UI with a session token or safe query state for user confirmation.
 */
shareRouter.post('/', (req, res, next) => {
  try {
    const parsed = ShareTargetFormSchema.parse(req.body);
    const rawText = parsed.text || parsed.title || '';
    const rawUrl = parsed.url || '';

    // Auto-redact sensitive values (OTPs, card numbers) immediately
    const sanitizedText = redactSensitiveData(rawText).redactedText;
    
    // Check if client expects JSON (e.g. from service worker interception)
    const acceptsJson = req.headers.accept?.includes('application/json');

    if (acceptsJson) {
      return res.json({
        success: true,
        sharedText: sanitizedText,
        sharedUrl: rawUrl,
        requiresConfirmation: true,
      });
    }

    // For standard browser form POST from Android share target:
    // Build redirect to client with query parameters for client-side preview
    const queryParams = new URLSearchParams();
    if (sanitizedText) queryParams.set('shared_text', encodeURIComponent(sanitizedText));
    if (rawUrl) queryParams.set('shared_url', encodeURIComponent(rawUrl));
    queryParams.set('source', 'android_share_target');

    return res.redirect(`${config.clientUrl}/?${queryParams.toString()}`);
  } catch (error) {
    next(error);
  }
});
