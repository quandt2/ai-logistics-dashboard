import type { ChartPoint } from '../types/api';

export function DataTable({ data }: { data: ChartPoint[] }) {
  if (!data.length) return <p className="muted">No rows to display.</p>;
  const columns = Object.keys(data[0]);
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>{columns.map(c => <td key={c}>{String(row[c])}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
