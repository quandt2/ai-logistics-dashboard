import type { AnalyticsResponse, ChartPoint, Kpis } from '../types/api';

type Filters = {
  status: string;
  carrier: string;
  region: string;
  startDate?: string;
  endDate?: string;
};

type DateRange = {
  minDate: string;
  maxDate: string;
};

function qs(filters?: Filters) {
  return filters ? `?${new URLSearchParams(filters).toString()}` : '';
}

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
  kpis: (filters?: Filters) =>
    getJson<Kpis>(`/kpis${qs(filters)}`),

  orderVolume: (filters?: Filters) =>
    getJson<ChartPoint[]>(`/charts/order-volume${qs(filters)}`),

  deliveryPerformance: (filters?: Filters) =>
    getJson<ChartPoint[]>(`/charts/delivery-performance${qs(filters)}`),

  carrierDelayRate: (filters?: Filters) =>
    getJson<ChartPoint[]>(`/charts/carrier-delay-rates${qs(filters)}`),

  ask: (question: string) =>
    postJson<AnalyticsResponse>('/ask', { question }),

  forecast: (sku: string, months: number) =>
    postJson<AnalyticsResponse>('/forecast', { sku, months }),

  dateRange: () =>
    getJson<DateRange>('/date-range'),
};