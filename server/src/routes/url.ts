import { Router } from 'express';
import { UrlScanRequestSchema, UrlScanResponseSchema } from '../schemas/index.js';
import { analyzeUrlSafely } from '../services/urlHeuristics.js';

export const urlRouter = Router();

urlRouter.post('/', async (req, res, next) => {
  try {
    const validated = UrlScanRequestSchema.parse(req.body);
    const result = analyzeUrlSafely(validated.url);
    const parsedResponse = UrlScanResponseSchema.parse(result);
    return res.json(parsedResponse);
  } catch (error) {
    next(error);
  }
});
