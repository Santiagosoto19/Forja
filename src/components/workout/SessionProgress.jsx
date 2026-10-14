export default function SessionProgress({ session }) {
  const sets = (session?.entries || []).flatMap((entry) => entry.sets || [])
  const done = sets.filter((set) => set.completed).length
  const total = sets.length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="card-surface glow-cyan rounded-[16px] p-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Progreso</p>
          <p className="mt-1 text-sm font-semibold text-title">Sesión en curso</p>
        </div>
        <p className="text-3xl font-bold text-primary">{pct}%</p>
      </div>
      <p className="mt-1 text-sm text-secondary">
        {done}/{total} series
      </p>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-border">
        <div
          className="progress-fill h-full rounded-full bg-primary shadow-[0_0_12px_#00F0FF]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
