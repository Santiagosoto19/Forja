import { toDisplayWeight, unitLabel } from '../../lib/units.js'
import Badge from '../ui/Badge.jsx'
import SetRow from './SetRow.jsx'

export default function ExerciseBlock({
  exercise,
  template,
  entry,
  lastSets,
  unit,
  onChangeSet,
  onToggleComplete,
}) {
  return (
    <section className="card-surface rounded-[14px] p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-title">{exercise?.name || 'Ejercicio'}</h3>
          <p className="text-sm text-secondary">
            {template.sets} × {template.repMin}–{template.repMax} · descanso {template.restSeconds}s
          </p>
          {template.notes ? <p className="mt-1 text-sm text-secondary">{template.notes}</p> : null}
        </div>
        <Badge variant="accent">{template.sets} series</Badge>
      </div>
      {lastSets?.length ? (
        <div className="mb-3 rounded-xl border border-primary/35 bg-primary/10 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Última sesión</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {lastSets.map((set) => (
              <Badge key={set.id || set.setNumber} variant="primary">
                {toDisplayWeight(set.weightKg, unit)}
                {unitLabel(unit)} × {set.reps}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mb-1 grid grid-cols-12 gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-secondary">
        <span className="col-span-1 text-center">#</span>
        <span className="col-span-2 text-center">Reps</span>
        <span className="col-span-3 text-center">Peso</span>
        <span className="col-span-2 text-center">RPE</span>
        <span className="col-span-2 text-center">RIR</span>
        <span className="col-span-2 text-center">Hecha</span>
      </div>
      <div className="space-y-2">
        {entry.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            unit={unit}
            onChange={(patch) => onChangeSet(set.id, patch)}
            onToggleComplete={(completed) => onToggleComplete(set, completed)}
          />
        ))}
      </div>
    </section>
  )
}
