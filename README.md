# AI-Powered Logistics Analytics Dashboard

A full-stack TypeScript application for a logistics analytics take-home assignment. The app provides a traditional KPI dashboard and a natural-language analytics interface over one read-only logistics dataset.

The implementation intentionally favors simple, correct, explainable logic over heavy infrastructure or over-engineering.

## Live Demo

Frontend: https://ai-logistics-dashboard-frontend-7o1zqgexp-quandt2s-projects.vercel.app/
Backend API: https://ai-logistics-dashboard.onrender.com

Example API endpoint:

https://ai-logistics-dashboard.onrender.com/api/kpis
## Repository

https://github.com/quandt2/ai-logistics-dashboard.git

## Tech Stack

- Frontend: React, TypeScript, Vite, Recharts
- Backend: Node.js, Express, TypeScript
- Data: Read-only CSV dataset loaded by the backend
- Forecasting: Simple moving average
- AI orchestration: Deterministic rule-based natural-language interpretation for a defined supported query set. This can be swapped with an LLM that returns the same structured contract.

## Local Setup

From the project root:

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

Build both apps:

```bash
npm run build
```

Start the built backend:

```bash
npm start
```

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

For deployment, set `VITE_API_BASE_URL` to the deployed backend `/api` URL, for example:

```bash
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

## System Overview

```text
User
  -> React Dashboard
  -> Express API
  -> AI Orchestrator
       -> Analytics Tool
       -> Forecasting Tool
  -> Read-only CSV Dataset
  -> Result + Explanation + Visualization
```

The backend is the source of truth for all KPI calculations, aggregations, filtering, forecasting, and business answers. The frontend renders the computed results and visualizations.

## Data Flow

```text
Dashboard load
  -> Fetch dataset date range
  -> Apply default full-date-range filters
  -> Fetch KPIs and chart data
  -> Render cards and charts

Natural-language question
  -> Parse question with deterministic orchestrator
  -> Select analytics or forecasting tool
  -> Compute from read-only dataset
  -> Return answer, chart type, filters, metrics, dimensions, query plan, and data
  -> Render answer, generated chart, explainability, and underlying data table
```

## Dashboard Features

The dashboard includes the required KPIs:

- Total orders
- Delivered orders
- Delayed orders
- On-time delivery rate
- Average delivery time

It also includes charts for:

- Order volume by month
- Delivery performance: delivered vs delayed
- Carrier delay rate

## Filters

The dashboard supports backend-powered filters:

- Start date
- End date
- Status
- Carrier
- Region

The date inputs are restricted to the available date range in the dataset. Filters are applied on the backend before KPI and chart calculations.

## Natural-Language Analytics

The app supports a defined subset of operational and business questions, such as:

- Which carrier has the highest delay rate?
- Show delayed orders by week for the last 3 months.
- How many orders were delivered late last month?
- Show orders by region.
- Show delayed orders by carrier.
- Show orders by status.
- Show orders by warehouse.
- Which region generates the most revenue?
- Which warehouse processes the most orders?
- Which carrier should we avoid?
- Predict demand for SKU BOOK-0115 for the next 4 months.

The natural-language interface returns:

- A direct answer
- A selected chart type
- A dynamically rendered chart when applicable
- Filters applied
- Metrics and dimensions used
- Query plan / structured interpretation
- Computation summary
- Limitations
- Underlying data table

## AI Orchestration

The current AI layer is implemented as a deterministic routing and orchestration layer rather than a live LLM call.

It performs four jobs:

1. Interpret the supported user question.
2. Select the correct computation path.
3. Call the analytics or forecasting tool.
4. Return computed results with explainability.

It does **not** generate business answers directly and does **not** execute raw AI-generated SQL. This keeps the project simple, reviewable, and safe from hallucinated answers.

A future improvement would be to replace only the interpretation layer with an LLM that returns validated JSON. The analytics and forecasting tools would remain the source of truth.

## Analytics Tool

The analytics tool computes dashboard and natural-language query results from the dataset.

Examples of supported computations:

- KPI calculations
- Order counts by month, region, warehouse, carrier, status, SKU, or category
- Delayed order counts
- Carrier delay rates
- Business recommendations based on computed delay rate or order volume

Dynamic chart selection is intentionally simple:

- Status breakdown -> pie chart
- Month-based trends -> line chart
- Carrier, region, warehouse, SKU, or category breakdowns -> bar chart
- Single-count answers -> table or summary

## Forecasting Tool

The forecasting tool predicts SKU demand using a simple moving average.

For a selected SKU, it:

1. Filters historical orders by SKU.
2. Aggregates quantity by month.
3. Calculates the average of recent monthly demand.
4. Projects demand for the requested number of future months.
5. Adds a simple 10% safety stock recommendation.

This method is intentionally basic and explainable for the expected scope of the assignment.

## Explainability

Each analytical response includes:

- Filters applied
- Metrics used
- Dimensions used
- Query plan
- Structured interpretation
- Computation summary
- Source of truth
- Limitations
- Underlying data

This makes it clear how the result was computed and avoids opaque AI-generated answers.

## Query History

The frontend keeps a short local query history for recently submitted natural-language questions. This is a UI convenience only and is not persisted.

## Caching

The backend caches the parsed CSV dataset in memory after the first read. This avoids repeatedly reading and parsing the CSV file on every request while still treating the dataset as read-only.

## API Endpoints

```text
GET  /api/date-range
GET  /api/kpis
GET  /api/charts/order-volume
GET  /api/charts/delivery-performance
GET  /api/charts/carrier-delay-rates
POST /api/ask
POST /api/forecast
```

Dashboard endpoints accept optional query parameters:

```text
status=delivered|delayed|all
carrier=DHL|FedEx|USPS|GLS|Royal Mail|DPD|all
region=North|South|East|West|all
startDate=YYYY-MM-DD
endDate=YYYY-MM-DD
```

Example:

```text
/api/kpis?status=delayed&carrier=DHL&startDate=2025-01-01&endDate=2025-12-31
```

## Assumptions

- The dataset is treated as read-only.
- The dataset does not include `promised_delivery_date`.
- `status = delayed` is used as the source of truth for delayed orders.
- `status = delivered` is used for delivered/on-time orders.
- Average delivery time is calculated as `delivery_date - order_date` in days.
- Date-range filtering uses `order_date`.
- Forecasting uses historical SKU quantity by month.

## Tradeoffs

This project intentionally uses a deterministic rule-based orchestration layer instead of a live LLM API.

Reasons:

- Keeps the system simple and correct within the expected assignment scope.
- Avoids hallucinated answers.
- Avoids raw AI-generated SQL.
- Makes the computation path easy to review.
- Removes the need for paid API keys or secret management.

Tradeoff:

- The natural-language interface supports a defined subset of questions instead of open-ended free-form analytics.

## Limitations

- Natural-language support is intentionally limited to supported analytical patterns.
- Forecasting is a simple moving average, not a production-grade demand planning model.
- The dataset is small and static.
- No authentication is included.
- Query history is stored only in frontend state.
- Date-range filters are available for dashboard KPIs and charts; natural-language examples use dataset-relative time windows.
- Relative date queries currently support a defined subset, such as "last month" and "last 3 months" for weekly delayed-order analysis. General phrases like "last 2 months" are not fully supported yet.

## Future Improvements

- Add an LLM interpreter that returns validated JSON only.
- Add stronger schema validation for interpreted queries.
- Add PostgreSQL instead of CSV for larger datasets.
- Add export to CSV for underlying query results.
- Add advanced forecasting models such as exponential smoothing or ARIMA.
- Add confidence intervals to forecasts.
- Add authentication and role-based access control.
- Add Docker setup.
- Add a more complete automated test suite.
- Add broader relative date parsing, such as "last 2 months", "last quarter", and custom time windows.

## Deployment Notes

The application is deployed as two services:

Frontend: Vercel
Backend: Render

Production URLs:

Frontend: https://ai-logistics-dashboard-frontend-7o1zqgexp-quandt2s-projects.vercel.app/
Backend API: https://ai-logistics-dashboard.onrender.com

Example backend endpoint:

https://ai-logistics-dashboard.onrender.com/api/kpis

Vercel settings:

Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Environment Variable:
VITE_API_BASE_URL=https://ai-logistics-dashboard.onrender.com/api

Render settings:

Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start

If CORS is restricted in production, set:

CORS_ORIGIN=https://ai-logistics-dashboard-frontend-7o1zqgexp-quandt2s-projects.vercel.app

## Submission Checklist

