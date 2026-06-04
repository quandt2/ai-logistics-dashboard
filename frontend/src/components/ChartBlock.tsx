import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartPoint } from '../types/api';

interface Props {
  title: string;
  data: ChartPoint[];
  type: 'bar' | 'line' | 'pie';
  valueKey?: string;
}

export function ChartBlock({ title, data, type, valueKey = 'value' }: Props) {
  return (
    <div className="card chart-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Line dataKey={valueKey} />
          </LineChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Tooltip />
            <Pie data={data} dataKey={valueKey} nameKey="label" outerRadius={100} label>
              {data.map((_, index) => <Cell key={index} />)}
            </Pie>
          </PieChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey={valueKey} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
