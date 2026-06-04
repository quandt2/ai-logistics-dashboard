# AI-Powered Logistics Analytics Dashboard

A full-stack TypeScript application for logistics analytics. It includes a KPI dashboard, dynamic charts, natural-language analytical querying, explainability, and SKU demand forecasting.

## Tech Stack

- Frontend: React, TypeScript, Vite, Recharts
- Backend: Node.js, Express, TypeScript
- Data: Read-only CSV dataset loaded by the backend
- Forecasting: Simple moving average
- AI orchestration: Structured intent routing layer. The current version uses deterministic parsing for the supported query set. This can be swapped with an LLM that returns the same structured contract.

## Local Setup

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

## Environment Variables

Create `.env` files if needed.

Backend:

```bash
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

Frontend:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

## System Overview

```text
User
  -> React Dashboard
  -> Express API
  -> AI Orchestrator
       -> Analytics Tool
       -> Forecasting Tool
  -> Read-only logistics dataset
```

The application uses one unified logistics dataset. The backend owns all calculations so the frontend only renders computed results.

## AI Orchestration Flow

```text
User Question
  -> AI / Intent Interpretation
  -> Tool Selection
  -> Structured Input
  -> Computation
  -> Result
  -> Explanation
  -> Visualization
```

The AI layer is not the source of truth. It does not generate business answers directly. It routes supported questions to deterministic tools that compute answers from the dataset.

Supported examples:

- Which carrier has the highest delay rate?
- Show delayed orders by week for the last 3 months
- How many orders were delivered late last month?
- Predict demand for SKU BOOK-0115 for the next 4 months

## Analytics Tool

The analytics tool computes:

- Total orders
- Delivered orders
- Delayed orders
- On-time delivery rate
- Average delivery time
- Order volume by month
- Delivery performance
- Carrier delay rate

Each AI answer includes:

- Filters applied
- Metrics used
- Dimensions used
- Query plan
- Underlying data rows

## Forecasting Tool

The forecasting tool aggregates historical demand by SKU and month, then applies a moving average over the most recent periods. Inventory recommendation adds a 10% safety stock buffer.

## Assumptions

- The dataset does not include `promised_delivery_date`.
- `status=delayed` is treated as the source of truth for delayed orders.
- `status=delivered` is treated as on-time for the on-time delivery rate.
- Average delivery time is calculated as `delivery_date - order_date` in days.
- Data is read-only.
- Last month and last 3 months are evaluated relative to the latest `order_date` in the dataset, not the current wall-clock date.

## Limitations

- Natural-language support is intentionally limited to a safe subset of analytical questions.
- The current AI orchestration implementation is rule-based to avoid hallucination and unsafe AI-generated SQL.
- Forecasting is simple and explainable, not a production-grade demand model.
- No authentication is included.

## Future Improvements

- Replace rule-based parsing with an LLM that returns validated JSON only.
- Add PostgreSQL persistence.
- Add tenant-aware filtering by client.
- Add export to CSV for underlying query results.
- Add confidence intervals to forecasts.
- Add provider-level cost and SLA analytics.

## Deployment Notes

A simple deployment option:

- Frontend: Vercel
- Backend: Render

Set `VITE_API_BASE_URL` in Vercel to the deployed Render API URL.
Set `CORS_ORIGIN` in Render to the deployed Vercel frontend URL.
