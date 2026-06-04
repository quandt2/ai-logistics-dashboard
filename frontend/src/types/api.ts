export interface Kpis {
  totalOrders: number;
  deliveredOrders: number;
  delayedOrders: number;
  onTimeDeliveryRate: number;
  averageDeliveryTimeDays: number;
}

export interface ChartPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

export interface AnalyticsResponse {
  answer: string;
  chartType: 'bar' | 'line' | 'pie' | 'table';
  filters: Record<string, string | number | boolean>;
  metrics: string[];
  dimensions: string[];
  queryPlan?: string[];
  data: ChartPoint[];
  method?: string;
  explanation?: string;
  recommendation?: string;
  historical?: ChartPoint[];
  forecast?: ChartPoint[];
}
