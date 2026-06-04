import { Router } from 'express';
import { getCarrierDelayRates, getDeliveryPerformance, getKpis, getOrderVolumeByMonth } from '../services/analyticsTool.js';

export const analyticsRouter = Router();

analyticsRouter.get('/kpis', (_req, res) => res.json(getKpis()));
analyticsRouter.get('/charts/order-volume', (_req, res) => res.json(getOrderVolumeByMonth()));
analyticsRouter.get('/charts/delivery-performance', (_req, res) => res.json(getDeliveryPerformance()));
analyticsRouter.get('/charts/carrier-delay-rate', (_req, res) => res.json(getCarrierDelayRates()));
