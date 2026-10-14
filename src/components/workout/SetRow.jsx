import { Check } from 'lucide-react'
import { fromDisplayWeight, toDisplayWeight, unitLabel } from '../../lib/units.js'

function toInputValue(value) {
  if (value === '' || value == null) return ''
  return String(value)
}

export default function SetRow({ set, unit, onChange, onToggleComplete }) {
  const canComplete = Number(set.reps) > 0 && Number(set.weightKg) > 0
  const weightDisplay =
    set.weightKg === '' || set.weightKg == null ? '' : toDisplayWeight(set.weightKg, unit)
  const rpe = Number(set.rpe)
  const rpeClass =
    rpe >= 9.5 ? 'border-danger text-danger' : rpe >= 8.5 ? 'border-warning text-warning' : ''

  return (
    <div
      className={`grid grid-cols-12 items-center gap-1.5 rounded-xl border px-2 py-2 text-sm transition-all duration-150 ${
        set.completed ? 'border-success bg-success/10' : 'border-border bg-surface-2'
      }`}
    >
      <p className="col-span-1 text-center font-semibold text-secondary">{set.setNumber}</p>
      <input
        className="input col-span-2 px-1.5 py-1.5 text-center"
        type="number"
        min="0"
        inputMode="numeric"
        aria-label="Repeticiones"
        value={toInputValue(set.reps)}
        onChange={(event) => onChange({ reps: event.target.value === '' ? '' : Number(event.target.value) })}
        placeholder="reps"
      />
      <input
        className="input col-span-3 px-1.5 py-1.5 text-center"
        type="number"
        min="0"
        step="0.5"
        inputMode="decimal"
        aria-label={`Peso en ${unitLabel(unit)}`}
        value={toInputValue(weightDisplay)}
        onChange={(event) =>
          onChange({
            weightKg: event.target.value === '' ? '' : fromDisplayWeight(event.target.value, unit),
          })
        }
        placeholder={unitLabel(unit)}
      />
      <input
        className={`input col-span-2 px-1 py-1.5 text-center ${rpeClass}`}
        type="number"
        min="1"
        max="10"
        step="0.5"
        aria-label="RPE"
        value={toInputValue(set.rpe)}
        onChange={(event) => onChange({ rpe: event.target.value === '' ? '' : Number(event.target.value) })}
        placeholder="RPE"
      />
      <input
        className="input col-span-2 px-1 py-1.5 text-center"
        type="number"
        min="0"
        max="10"
        aria-label="RIR"
        value={toInputValue(set.rir)}
        onChange={(event) => onChange({ rir: event.target.value === '' ? '' : Number(event.target.value) })}
        placeholder="RIR"
      />
      <div className="col-span-2 flex items-center justify-center">
        <button
          type="button"
          role="checkbox"
          aria-checked={Boolean(set.completed)}
          aria-label="Completada"
          disabled={!set.completed && !canComplete}
          onClick={() => {
            if (!set.completed && !canComplete) return
            onToggleComplete(!set.completed)
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 transition-all duration-150 ${
            set.completed
              ? 'check-pop border-success bg-success text-white shadow-sm'
              : 'border-border bg-surface text-transparent hover:border-success/60 disabled:opacity-40'
          }`}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
