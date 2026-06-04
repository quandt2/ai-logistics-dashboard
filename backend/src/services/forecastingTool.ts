import type { ChartPoint } from '../types/order.js';
import { getOrders } from './orderRepository.js';

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function addMonths(month: string, offset: number): string {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(year, m - 1 + offset, 1);
  return monthKey(d);
}

export function listSkus(): string[] {
  return [...new Set(getOrders().map(o => o.sku))].sort();
}

export function forecastDemand(sku: string, months = 4) {
  const rows = getOrders().filter(o => o.sku.toLowerCase() === sku.toLowerCase());
  if (rows.length === 0) {
    return { error: `No historical orders found for SKU ${sku}.`, availableSkus: listSkus().slice(0, 10) };
  }

  const monthly = new Map<string, number>();
  for (const order of rows) monthly.set(monthKey(order.orderDate), (monthly.get(monthKey(order.orderDate)) ?? 0) + order.quantity);
  const historical: ChartPoint[] = [...monthly.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value, type: 'historical' }));

  const values = historical.map(p => Number(p.value));
  const window = Math.min(3, values.length);
  const base = values.slice(-window).reduce((a, b) => a + b, 0) / window;
  const latestMonth = String(historical[historical.length - 1].label);
  const forecast: ChartPoint[] = Array.from({ length: months }).map((_, i) => ({
    label: addMonths(latestMonth, i + 1),
    value: Number(base.toFixed(2)),
    type: 'forecast'
  }));

  const recommendedInventory = Math.ceil(base * 1.1);

  return {
    sku,
    method: `${window}-period moving average`,
    explanation: `Historical monthly quantity is aggregated by SKU. The next ${months} months use the average of the most recent ${window} month(s). A 10% safety buffer is added for inventory planning.`,
    recommendation: `Plan approximately ${recommendedInventory} units per month for ${sku}, including a 10% safety stock buffer.`,
    metrics: ['quantity'],
    dimensions: ['month', 'sku'],
    filters: { sku, forecastMonths: months },
    historical,
    forecast,
    data: [...historical, ...forecast]
  };
}
