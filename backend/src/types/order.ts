export type OrderStatus = 'delivered' | 'delayed';

export interface Order {
  clientId: string;
  orderId: string;
  orderDate: Date;
  deliveryDate: Date;
  carrier: string;
  originCity: string;
  destinationCity: string;
  status: OrderStatus;
  sku: string;
  productCategory: string;
  quantity: number;
  unitPriceUsd: number;
  orderValueUsd: number;
  isPromo: boolean;
  promoDiscountPct: number;
  region: string;
  warehouse: string;
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
  queryPlan: string[];
  data: ChartPoint[];

  method?: string;
  explanation?: string;
  recommendation?: string;
  
  structuredInterpretation?: {
    intent: string;
    tool: 'analytics' | 'forecasting';
    metric?: string;
    dimension?: string;
    chartType?: string;
    confidence: 'high' | 'medium' | 'low';
  };

  computationSummary?: {
    recordsScanned: number;
    recordsReturned: number;
    aggregation: string;
    sourceOfTruth: string;
  };

  limitations?: string[];
}
