import Card from '../ui/Card.jsx'

export default function MetricCard({ label, value, hint, icon: Icon }) {
  return (
    <Card className="w-full">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-title">{value}</p>
      {hint ? <p className="mt-1 text-xs text-secondary">{hint}</p> : null}
    </Card>
  )
}
