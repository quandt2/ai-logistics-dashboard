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
  const orders = getOrders();

  const rows = orders.filter(
    (o) => o.sku.toLowerCase() === sku.toLowerCase()
  );

  if (rows.length === 0) {
    return {
      answer: `No historical orders found for SKU ${sku}. Try one of the available SKUs below.`,
      chartType: 'table',
      filters: { sku },
      metrics: ['quantity'],
      dimensions: ['month', 'sku'],
      queryPlan: [
        'Filter historical orders by SKU',
        'No matching records found',
        'Return safe fallback with sample available SKUs'
      ],
      structuredInterpretation: {
        intent: 'demand_forecast',
        tool: 'forecasting',
        metric: 'quantity',
        dimension: 'month',
        chartType: 'table',
        confidence: 'low'
      },
      computationSummary: {
        recordsScanned: orders.length,
        recordsReturned: 0,
        aggregation: `No historical demand records found for SKU ${sku}`,
        sourceOfTruth: 'Read-only logistics CSV dataset'
      },
      limitations: [
        'Forecast cannot be generated without historical SKU demand.',
        'Try a SKU that exists in the dataset.'
      ],
      data: listSkus()
        .slice(0, 10)
        .map((availableSku, index) => ({
          label: availableSku,
          value: index + 1
        }))
    };
  }

  const monthly = new Map<string, number>();

  // Find boundaries of true timeline for this specific SKU
  const historicalTimestamps = rows.map(o => o.orderDate.getTime());
  const minDate = new Date(Math.min(...historicalTimestamps));
  const maxDate = new Date(Math.max(...historicalTimestamps));

  // Initialize continuous chronological span with zeros
  const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  while (current <= end) {
    monthly.set(monthKey(current), 0);
    current.setMonth(current.getMonth() + 1);
  }

  // Accumulate transactional quantities over the complete, padded baseline map
  for (const order of rows) {
    const key = monthKey(order.orderDate);
    monthly.set(key, (monthly.get(key) ?? 0) + order.quantity);
  }
  
  const historical: ChartPoint[] = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({
      label,
      value,
      type: 'historical'
    }));

  const values = historical.map((p) => Number(p.value));
  const window = Math.min(3, values.length);

  const base =
    values.slice(-window).reduce((a, b) => a + b, 0) / window;

  const latestMonth = String(historical[historical.length - 1].label);

  const forecast: ChartPoint[] = Array.from({ length: months }).map((_, i) => ({
    label: addMonths(latestMonth, i + 1),
    value: Number(base.toFixed(2)),
    type: 'forecast'
  }));

  const data = [...historical, ...forecast];
  const recommendedInventory = Math.ceil(base * 1.1);

  return {
    answer: `Forecasted demand for SKU ${sku.toUpperCase()} is approximately ${Number(
      base.toFixed(2)
    )} units per month for the next ${months} months.`,
    chartType: 'line',
    sku,
    method: `${window}-period moving average`,
    explanation: `Historical monthly quantity is aggregated by SKU. The next ${months} months use the average of the most recent ${window} month(s). A 10% safety buffer is added for inventory planning.`,
    recommendation: `Plan approximately ${recommendedInventory} units per month for ${sku.toUpperCase()}, including a 10% safety stock buffer.`,
    metrics: ['quantity'],
    dimensions: ['month', 'sku'],
    filters: { sku: sku.toUpperCase(), forecastMonths: months },
    queryPlan: [
      'Filter historical orders by SKU',
      'Aggregate quantity by order month',
      `Calculate the average of the most recent ${window} month(s)`,
      `Project demand for the next ${months} month(s)`,
      'Add a 10% safety stock recommendation'
    ],
    historical,
    forecast,
    structuredInterpretation: {
      intent: 'demand_forecast',
      tool: 'forecasting',
      metric: 'quantity',
      dimension: 'month',
      chartType: 'line',
      confidence: 'medium'
    },
    computationSummary: {
      recordsScanned: orders.length,
      recordsReturned: data.length,
      aggregation: `Aggregated historical quantity by month for SKU ${sku.toUpperCase()}`,
      sourceOfTruth: 'Read-only logistics CSV dataset'
    },
    limitations: [
      'Forecast uses a simple moving average model.',
      'Seasonality, promotions, supply constraints, and external demand signals are not modeled.',
      'Inventory recommendation includes a simple safety buffer and should be adjusted by business context.'
    ],
    data
  };
}