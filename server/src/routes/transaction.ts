import { Router } from 'express';
import { TransactionScanRequestSchema, TransactionScanResponseSchema } from '../schemas/index.js';
import { evaluateTransactionAnomaly } from '../services/transactionAnomaly.js';

export const transactionRouter = Router();

transactionRouter.post('/', (req, res, next) => {
  try {
    const validated = TransactionScanRequestSchema.parse(req.body);
    const result = evaluateTransactionAnomaly(validated);
    const parsedResponse = TransactionScanResponseSchema.parse(result);
    return res.json(parsedResponse);
  } catch (error) {
    next(error);
  }
});
