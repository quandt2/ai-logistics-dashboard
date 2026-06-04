import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { aiRouter } from './routes/ai.js';
import { analyticsRouter } from './routes/analytics.js';
import { forecastRouter } from './routes/forecast.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', analyticsRouter);
app.use('/api', aiRouter);
app.use('/api', forecastRouter);

app.listen(port, () => {
  console.log(`Logistics analytics backend running on http://localhost:${port}`);
});
