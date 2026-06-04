import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartPoint } from '../types/api';

interface Props {
  title: string;
  data: ChartPoint[];
  type: 'bar' | 'line' | 'pie';
  valueKey?: string;
}

const COLORS = [
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#9333ea',
  '#ea580c',
  '#0891b2',
  '#ca8a04',
  '#4f46e5'
];

function colorForLabel(label?: string, index = 0) {
  const lower = String(label ?? '').toLowerCase();

  if (lower.includes('delivered')) return '#16a34a';
  if (lower.includes('delayed')) return '#dc2626';

  return COLORS[index % COLORS.length];
}

export function ChartBlock({ title, data, type, valueKey = 'value' }: Props) {
  return (
    <div className="card chart-card">
      <h3>{title}</h3>

      <ResponsiveContainer width="100%" height={280}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563eb' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey="label"
              outerRadius={105}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={colorForLabel(entry.label, index)}
                />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey={valueKey} radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={colorForLabel(entry.label, index)}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
