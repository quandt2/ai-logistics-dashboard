import { useEffect, useState } from 'react';
import { api } from './api/client';
import { ChartBlock } from './components/ChartBlock';
import { DataTable } from './components/DataTable';
import { KpiCard } from './components/KpiCard';
import type { AnalyticsResponse, ChartPoint, Kpis } from './types/api';
import './styles.css';

export default function App() {

  const [filters, setFilters] = useState({
    status: 'all',
    carrier: 'all',
    region: 'all'
  });

  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [orderVolume, setOrderVolume] = useState<ChartPoint[]>([]);
  const [performance, setPerformance] = useState<ChartPoint[]>([]);
  const [carrierDelay, setCarrierDelay] = useState<ChartPoint[]>([]);
  const [question, setQuestion] = useState('Which carrier has the highest delay rate?');
  const [answer, setAnswer] = useState<AnalyticsResponse | null>(null);
  const [forecast, setForecast] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    Promise.all([
      api.kpis(filters),
      api.orderVolume(filters),
      api.deliveryPerformance(filters),
      api.carrierDelayRate(filters)
    ])
      .then(([k, volume, perf, carrier]) => {
        setKpis(k);
        setOrderVolume(volume);
        setPerformance(perf);
        setCarrierDelay(carrier);
      })
      .catch(console.error);
  }, [filters]);

  async function submitQuestion() {
    const result = await api.ask(question);
    setAnswer(result);

    setQueryHistory((prev) => {
      const next = [question, ...prev.filter((q) => q !== question)];
      return next.slice(0, 5);
    });
  }

  async function runForecast() {
    setForecast(await api.forecast('BOOK-0115', 4));
  }

  return (
    <main>
      <header>
        <p className="eyebrow">AI-Powered Logistics Analytics</p>
        <h1>Logistics Operations Dashboard</h1>
        <p className="muted">Dashboard KPIs, natural-language analytics, explainability, and SKU demand forecasting from one read-only dataset.</p>
      </header>

      <section className="card filters-card">
        <div className="filters-header">
          <h2>Filters</h2>
          <button
            className="secondary-button"
            onClick={() =>
              setFilters({
                status: 'all',
                carrier: 'all',
                region: 'all'
              })
            }>
            Reset
          </button>
        </div>

        <div className="filters-grid">
          <label>
            Date Range
            <select>
              <option>2025-01-01 ~ 2025-12-31</option>
            </select>
          </label>

          <label>
            Status
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value.toLowerCase()
                }))
              }
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
          </select>
          </label>

          <label>
            Carrier
            <select
              value={filters.carrier}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  carrier: e.target.value
                }))
              }
            >
              <option value="all">All Carriers</option>
              <option value="USPS">USPS</option>
              <option value="GLS">GLS</option>
              <option value="Royal Mail">Royal Mail</option>
              <option value="FedEx">FedEx</option>
              <option value="DHL">DHL</option>
              <option value="DPD">DPD</option>
            </select>
          </label>

          <label>
            Region
            <select
              value={filters.region}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  region: e.target.value
                }))
              }>
                <option value="all">All Regions</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
            </select>
          </label>
        </div>

        <p className="active-filter">
          Status={filters.status},
          Carrier={filters.carrier},
          Region={filters.region}
        </p>
      </section>
      <section className="grid kpi-grid">
        {kpis && <>
          <KpiCard title="Total Orders" value={kpis.totalOrders} tone="blue"/>
          <KpiCard title="Delivered Orders" value={kpis.deliveredOrders} tone="green"/>
          <KpiCard title="Delayed Orders" value={kpis.delayedOrders} tone="red"/>
          <KpiCard title="On-Time Rate" value={`${kpis.onTimeDeliveryRate}%`} tone="purple"/>
          <KpiCard title="Avg Delivery Time" value={`${kpis.averageDeliveryTimeDays} days`} tone="orange"/>
        </>}
      </section>

      <section className="grid two-col">
        <ChartBlock title="Order Volume by Month" data={orderVolume} type="line" />
        <ChartBlock title="Delivery Performance" data={performance} type="pie" />
        <ChartBlock title="Carrier Delay Rate (%)" data={carrierDelay} type="bar" />
      </section>

      <section className="card">
        <h2>Ask Logistics Data</h2>
        <div className="ask-row">
          <input value={question} onChange={e => setQuestion(e.target.value)} />
          <button onClick={submitQuestion}>Ask</button>
        </div>
        <div className="examples">
          <button onClick={() => setQuestion('Which carrier has the highest delay rate?')}>Highest delay carrier</button>
          <button onClick={() => setQuestion('Show delayed orders by week for the last 3 months')}>Delayed by week</button>
          <button onClick={() => setQuestion('How many orders were delivered late last month?')}>Late last month</button>
        </div>
        {queryHistory.length > 0 && (
        <div className="query-history">
          <h4>Query History</h4>
          {queryHistory.map((q) => (
            <button key={q} onClick={() => setQuestion(q)}>
              {q}
            </button>
          ))}
        </div>
        )}
        {answer && <ResultPanel result={answer} />}
      </section>

      <section className="card">
        <h2>Forecast Demand</h2>
        <p className="muted">Demo forecast for SKU BOOK-0115 using moving average.</p>
        <button onClick={runForecast}>Predict demand for BOOK-0115 next 4 months</button>
        {forecast && <ResultPanel result={forecast} />}
      </section>
    </main>
  );
}

function ResultPanel({ result }: { result: AnalyticsResponse }) {
  return (
    <div className="result">
      <h3>{result.answer ?? result.recommendation}</h3>
      {result.method && <p><strong>Method:</strong> {result.method}</p>}
      {result.explanation && <p>{result.explanation}</p>}
      {result.recommendation && <p><strong>Recommendation:</strong> {result.recommendation}</p>}
      {result.data?.length > 0 && result.chartType !== 'table' && (
        <ChartBlock title="Generated Visualization" data={result.data} type={result.chartType === 'pie' ? 'pie' : result.chartType === 'line' ? 'line' : 'bar'} />
      )}
      <h4>Explainability</h4>
      <p><strong>Filters:</strong> {JSON.stringify(result.filters ?? {})}</p>
      <p><strong>Metrics:</strong> {(result.metrics ?? []).join(', ') || 'N/A'}</p>
      <p><strong>Dimensions:</strong> {(result.dimensions ?? []).join(', ') || 'N/A'}</p>
      {result.queryPlan && <ol>{result.queryPlan.map((step, i) => <li key={i}>{step}</li>)}</ol>}
      <h4>Underlying Data</h4>
      <DataTable data={result.data ?? []} />
    </div>
  );
}
