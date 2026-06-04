import type { AnalyticsResponse, ChartPoint, Kpis } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  kpis: () => getJson<Kpis>('/kpis'),
  orderVolume: () => getJson<ChartPoint[]>('/charts/order-volume'),
  deliveryPerformance: () => getJson<ChartPoint[]>('/charts/delivery-performance'),
  carrierDelayRate: () => getJson<ChartPoint[]>('/charts/carrier-delay-rate'),
  ask: (question: string) => postJson<AnalyticsResponse>('/ask', { question }),
  forecast: (sku: string, months: number) => postJson<AnalyticsResponse>('/forecast', { sku, months })
};
