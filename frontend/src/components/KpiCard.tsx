interface Props {
  title: string;
  value: string | number;
}

export function KpiCard({ title, value }: Props) {
  return (
    <div className="card kpi-card">
      <div className="muted">{title}</div>
      <strong>{value}</strong>
    </div>
  );
}
