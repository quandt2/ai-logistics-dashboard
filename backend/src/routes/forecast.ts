import { Router } from 'express';
import { forecastDemand, listSkus } from '../services/forecastingTool.js';

export const forecastRouter = Router();

forecastRouter.get('/skus', (_req, res) => res.json(listSkus()));
forecastRouter.post('/forecast', (req, res) => {
  const sku = String(req.body?.sku ?? 'BOOK-0115');
  const months = Number(req.body?.months ?? 4);
  return res.json(forecastDemand(sku, months));
});
