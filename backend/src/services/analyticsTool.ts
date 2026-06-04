import type { AnalyticsResponse, ChartPoint, Order } from '../types/order.js';
import { getOrders } from './orderRepository.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type OrderFilters = {
  status?: string;
  carrier?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
};

function applyFilters(orders: Order[], filters: OrderFilters = {}): Order[] {
  return orders.filter((order) => {
    if (filters.status && filters.status !== 'all' && order.status !== filters.status) {
      return false;
    }

    if (filters.carrier && filters.carrier !== 'all' && order.carrier !== filters.carrier) {
      return false;
    }

    if (filters.region && filters.region !== 'all' && order.region !== filters.region) {
      return false;
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      if (order.orderDate < start) return false;
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      if (order.orderDate > end) return false;
    }

    return true;
  });
}

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getDatasetDateRange() {
  const orders = getOrders();

  const timestamps = orders
    .map((order) => order.orderDate.getTime())
    .filter(Number.isFinite);

  const min = new Date(Math.min(...timestamps));
  const max = new Date(Math.max(...timestamps));

  return {
    minDate: formatDateInput(min),
    maxDate: formatDateInput(max)
  };
}

function deliveryDays(order: Order): number | null {
  if (!(order.orderDate instanceof Date) || !(order.deliveryDate instanceof Date)) {
    return null;
  }

  const orderTime = order.orderDate.getTime();
  const deliveryTime = order.deliveryDate.getTime();

  if (!Number.isFinite(orderTime) || !Number.isFinite(deliveryTime)) {
    return null;
  }

  return Math.max(0, Math.round((deliveryTime - orderTime) / MS_PER_DAY));
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function weekKey(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / MS_PER_DAY);
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function lastMonths(orders: Order[], months: number): Order[] {
  const maxTime = Math.max(...orders.map(o => o.orderDate.getTime()));
  const start = new Date(maxTime);
  start.setMonth(start.getMonth() - months);
  return orders.filter(o => o.orderDate >= start && o.orderDate.getTime() <= maxTime);
}

export function getKpis(filters: OrderFilters = {}) {
  const orders = applyFilters(getOrders(), filters);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const delayedOrders = orders.filter(o => o.status === 'delayed').length;
  const deliveryDurations = orders
  .map((order) => deliveryDays(order))
  .filter((days): days is number => days !== null);

  const avgDeliveryDays =
    deliveryDurations.length > 0
      ? deliveryDurations.reduce((sum, days) => sum + days, 0) / deliveryDurations.length
      : 0;

  return {
    totalOrders,
    deliveredOrders,
    delayedOrders,
    onTimeDeliveryRate: totalOrders > 0 ? Number(((deliveredOrders / totalOrders) * 100).toFixed(2)) : 0,
    averageDeliveryTimeDays: Number(avgDeliveryDays.toFixed(2))
  };
}

export function getOrderVolumeByMonth(filters: OrderFilters = {}): ChartPoint[] {
  const grouped = new Map<string, number>();
  for (const order of applyFilters(getOrders(), filters)) grouped.set(monthKey(order.orderDate), (grouped.get(monthKey(order.orderDate)) ?? 0) + 1);
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value, orders: value }));
}

export function getDeliveryPerformance(filters: OrderFilters = {}): ChartPoint[] {
  const orders = applyFilters(getOrders(), filters);
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const delayed = orders.filter(o => o.status === 'delayed').length;
  return [
    { label: 'Delivered', value: delivered },
    { label: 'Delayed', value: delayed }
  ];
}

export function getCarrierDelayRates(filters: OrderFilters = {}): ChartPoint[] {
  const carrierStats = new Map<string, { total: number; delayed: number }>();
  for (const order of applyFilters(getOrders(), filters)) {
    const current = carrierStats.get(order.carrier) ?? { total: 0, delayed: 0 };
    current.total += 1;
    if (order.status === 'delayed') current.delayed += 1;
    carrierStats.set(order.carrier, current);
  }

  return [...carrierStats.entries()]
    .map(([label, s]) => ({ label, value: Number(((s.delayed / s.total) * 100).toFixed(2)), totalOrders: s.total, delayedOrders: s.delayed }))
    .sort((a, b) => Number(b.value) - Number(a.value));
}

export function delayedOrdersByWeekLastMonths(months = 3): AnalyticsResponse {
  const filtered = lastMonths(getOrders(), months).filter(o => o.status === 'delayed');
  const grouped = new Map<string, number>();
  for (const order of filtered) grouped.set(weekKey(order.orderDate), (grouped.get(weekKey(order.orderDate)) ?? 0) + 1);
  const data = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value, delayedOrders: value }));

  return {
    answer: `There were ${filtered.length} delayed orders in the last ${months} months of the dataset.`,
    chartType: 'line',
    filters: { status: 'delayed', timeRange: `last ${months} months from latest dataset date` },
    metrics: ['delayed_orders'],
    dimensions: ['order_week'],
    queryPlan: ['Filter orders to delayed status', `Limit to last ${months} months based on latest order_date in dataset`, 'Group by calendar week', 'Count orders'],
    data
  };
}

export function carrierHighestDelayRate(): AnalyticsResponse {
  const data = getCarrierDelayRates();
  const top = data[0];

  return {
    answer: `${top.label} has the highest delay rate at ${top.value}%.`,
    chartType: 'bar',
    filters: {},
    metrics: ['delay_rate'],
    dimensions: ['carrier'],
    queryPlan: [
      'Group orders by carrier',
      'Calculate delayed_orders / total_orders * 100',
      'Sort descending by delay rate'
    ],
    structuredInterpretation: {
      intent: 'business_question',
      tool: 'analytics',
      metric: 'delay_rate',
      dimension: 'carrier',
      chartType: 'bar',
      confidence: 'high'
    },
    computationSummary: {
      recordsScanned: getOrders().length,
      recordsReturned: data.length,
      aggregation: 'Grouped orders by carrier and calculated delay rate',
      sourceOfTruth: 'Read-only logistics CSV dataset'
    },
    limitations: [
      'Delay rate is based on status=delayed because the dataset does not include promised delivery date.',
      'Recommendation should be validated with larger operational datasets before business action.'
    ],
    data
  };
}

export function delayedOrdersLastMonth(): AnalyticsResponse {
  const orders = getOrders();
  const latest = new Date(Math.max(...orders.map(o => o.orderDate.getTime())));
  const start = new Date(latest.getFullYear(), latest.getMonth() - 1, 1);
  const end = new Date(latest.getFullYear(), latest.getMonth(), 1);
  const filtered = orders.filter(o => o.status === 'delayed' && o.orderDate >= start && o.orderDate < end);
  return {
    answer: `${filtered.length} orders were delivered late last month in the dataset period (${monthKey(start)}).`,
    chartType: 'table',
    filters: { status: 'delayed', month: monthKey(start) },
    metrics: ['delayed_orders'],
    dimensions: ['month'],
    queryPlan: ['Find latest order month in dataset', 'Select the previous full month', 'Filter delayed orders', 'Count matching orders'],
    data: [{ label: monthKey(start), value: filtered.length, delayedOrders: filtered.length }]
  };
}

export function dynamicAnalyticsQuery(question: string): AnalyticsResponse {
  const q = question.toLowerCase();
  const orders = getOrders();
  const knownTerms = [
    'orders',
    'delayed',
    'delivered',
    'carrier',
    'region',
    'warehouse',
    'status',
    'sku',
    'category',
    'month',
    'revenue'
  ];

  const isAmbiguous = !knownTerms.some((term) => q.includes(term));

  if (isAmbiguous) {
    return {
      answer:
        'I need a clearer analytics question. Try asking about orders, delays, carriers, regions, warehouses, revenue, status, SKU, or product category.',
      chartType: 'table',
      filters: {},
      metrics: [],
      dimensions: [],
      queryPlan: [
        'Interpret natural-language question',
        'No supported metric or dimension was detected',
        'Return a clarification instead of generating an unsupported answer'
      ],
      data: []
    };
  }

  

  let filtered = orders;
  let metric = 'orders';
  let dimension: 'carrier' | 'region' | 'warehouse' | 'productCategory' | 'sku' | 'status' | 'month' = 'status';
  let chartType: 'bar' | 'line' | 'pie' | 'table' = 'bar';

  if (q.includes('delayed')) {
    filtered = filtered.filter(o => o.status === 'delayed');
    metric = 'delayed_orders';
  }

  if (q.includes('delivered')) {
    filtered = filtered.filter(o => o.status === 'delivered');
    metric = 'delivered_orders';
  }

  if (q.includes('carrier')) dimension = 'carrier';
  else if (q.includes('region')) dimension = 'region';
  else if (q.includes('warehouse')) dimension = 'warehouse';
  else if (q.includes('category')) dimension = 'productCategory';
  else if (q.includes('sku')) dimension = 'sku';
  else if (q.includes('month')) {
    dimension = 'month';
    chartType = 'line';
  } else if (q.includes('status')) {
    dimension = 'status';
    chartType = 'pie';
  }

  const grouped = new Map<string, number>();

  for (const order of filtered) {
    const key =
      dimension === 'month'
        ? monthKey(order.orderDate)
        : String(order[dimension] ?? 'Unknown');

    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  const data = [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({
      label,
      value,
      orders: value
    }));

  return {
    answer: `Found ${filtered.length} matching ${metric.replace('_', ' ')} grouped by ${dimension}.`,
    chartType,
    filters: {
      status: q.includes('delayed')
        ? 'delayed'
        : q.includes('delivered')
          ? 'delivered'
          : 'all'
    },
    metrics: [metric],
    dimensions: [dimension],
    queryPlan: [
      'Interpret natural-language question',
      'Detect metric and dimension',
      'Apply status filter if requested',
      'Group matching records',
      'Select chart type based on dimension',
      'Return computed data and visualization'
    ],
    structuredInterpretation: {
      intent: 'dynamic_analytics_query',
      tool: 'analytics',
      metric,
      dimension,
      chartType,
      confidence: 'medium'
    },

    computationSummary: {
      recordsScanned: orders.length,
      recordsReturned: data.length,
      aggregation: `Grouped ${filtered.length} matching records by ${dimension}`,
      sourceOfTruth: 'Read-only logistics CSV dataset'
    },

    limitations: [
      'This answer is computed from the provided dataset only.',
      'The natural-language parser supports a defined subset of analytics questions.',
      'No raw AI-generated SQL is executed.'
    ],
    data
  };
}
