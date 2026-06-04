interface Props {
  title: string;
  value: string | number;
  tone?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

export function KpiCard({ title, value, tone = 'blue'}: Props) {
  return (
    <div className={`card kpi-card $tone`}>
      <div className="kpi-title">{title}</div>
      <strong>{value}</strong>
    </div>
  );
}
