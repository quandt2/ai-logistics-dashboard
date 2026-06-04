import type { AnalyticsResponse } from '../types/order.js';
import {
  carrierHighestDelayRate,
  delayedOrdersByWeekLastMonths,
  delayedOrdersLastMonth,
  dynamicAnalyticsQuery
} from './analyticsTool.js';
import { forecastDemand } from './forecastingTool.js';

export function answerQuestion(
  question: string
): AnalyticsResponse | ReturnType<typeof forecastDemand> {
  const q = question.toLowerCase();

  if (q.includes('forecast') || q.includes('predict') || q.includes('demand')) {
    const skuMatch = question.match(/[A-Z]+-\d{4}/i);
    const monthsMatch = question.match(/next\s+(\d+)\s+months?/i);
    const sku = skuMatch?.[0] ?? 'BOOK-0115';
    const months = monthsMatch ? Number(monthsMatch[1]) : 4;
    return forecastDemand(sku.toUpperCase(), months);
  }

  if (q.includes('highest') && q.includes('delay') && q.includes('carrier')) {
    return carrierHighestDelayRate();
  }

  if (q.includes('delayed') && q.includes('week')) {
    const monthsMatch = question.match(/last\s+(\d+)\s+months?/i);
    return delayedOrdersByWeekLastMonths(monthsMatch ? Number(monthsMatch[1]) : 3);
  }

  if ((q.includes('late') || q.includes('delayed')) && q.includes('last month')) {
    return delayedOrdersLastMonth();
  }

  return dynamicAnalyticsQuery(question);
}