import { Router } from 'express';
import { getCarrierDelayRates, getDeliveryPerformance, getKpis, getOrderVolumeByMonth } from '../services/analyticsTool.js';
import type { OrderFilters } from '../services/analyticsTool.js';

function filtersFromQuery(query: any): OrderFilters {
  return {
    status: typeof query.status === 'string' ? query.status : 'all',
    carrier: typeof query.carrier === 'string' ? query.carrier : 'all',
    region: typeof query.region === 'string' ? query.region : 'all'
  };
}

export const analyticsRouter = Router();

analyticsRouter.get('/kpis', (req, res) => {
  res.json(getKpis(filtersFromQuery(req.query)));
});

analyticsRouter.get('/charts/order-volume', (req, res) => {
  res.json(getOrderVolumeByMonth(filtersFromQuery(req.query)));
});

analyticsRouter.get('/charts/delivery-performance', (req, res) => {
  res.json(getDeliveryPerformance(filtersFromQuery(req.query)));
});

analyticsRouter.get('/charts/carrier-delay-rates', (req, res) => {
  res.json(getCarrierDelayRates(filtersFromQuery(req.query)));
});
