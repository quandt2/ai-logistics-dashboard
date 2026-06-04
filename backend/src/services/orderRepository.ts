import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'node:url';
import type { Order } from '../types/order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cache: Order[] | null = null;

export function getOrders(): Order[] {
  if (cache) return cache;

  const csvPath = path.join(__dirname, '..', 'data', 'mock_logistics_data.csv');
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(raw, { columns: true, skip_empty_lines: true });

  cache = records.map((row: Record<string, string>) => ({
    clientId: row.client_id,
    orderId: row.order_id,
    orderDate: new Date(row.order_date),
    deliveryDate: new Date(row.delivery_date),
    carrier: row.carrier,
    originCity: row.origin_city,
    destinationCity: row.destination_city,
    status: row.status as Order['status'],
    sku: row.sku,
    productCategory: row.product_category,
    quantity: Number(row.quantity),
    unitPriceUsd: Number(row.unit_price_usd),
    orderValueUsd: Number(row.order_value_usd),
    isPromo: row.is_promo === '1',
    promoDiscountPct: Number(row.promo_discount_pct),
    region: row.region,
    warehouse: row.warehouse
  }));

  return cache;
}
