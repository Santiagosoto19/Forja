import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { MUSCLE_LABELS } from '../../data/seedExercises.js'
import Badge from '../ui/Badge.jsx'

export default function ExerciseEditor({
  item,
  exercise,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMove,
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="mb-3 flex items-start gap-2">
        <div className="flex flex-col pt-0.5 text-secondary">
          <button
            type="button"
            aria-label="Subir ejercicio"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            className="rounded-md p-0.5 hover:bg-canvas disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Bajar ejercicio"
            disabled={isLast}
            onClick={() => onMove(1)}
            className="rounded-md p-0.5 hover:bg-canvas disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-title">{exercise?.name || 'Ejercicio'}</p>
            <Badge>{MUSCLE_LABELS[exercise?.muscleGroup] || exercise?.muscleGroup}</Badge>
          </div>
        </div>
        <button
          type="button"
          aria-label="Quitar ejercicio"
          onClick={onRemove}
          className="rounded-lg p-2 text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label>
          <span className="field-label">Series</span>
          <input
            className="input px-2 py-1.5"
            type="number"
            min="1"
            value={item.sets}
            onChange={(event) => onChange({ sets: Number(event.target.value) || 1 })}
          />
        </label>
        <label>
          <span className="field-label">Rep min</span>
          <input
            className="input px-2 py-1.5"
            type="number"
            min="1"
            value={item.repMin}
            onChange={(event) => onChange({ repMin: Number(event.target.value) || 1 })}
          />
        </label>
        <label>
          <span className="field-label">Rep max</span>
          <input
            className="input px-2 py-1.5"
            type="number"
            min="1"
            value={item.repMax}
            onChange={(event) => onChange({ repMax: Number(event.target.value) || 1 })}
          />
        </label>
        <label>
          <span className="field-label">Descanso (s)</span>
          <input
            className="input px-2 py-1.5"
            type="number"
            min="0"
            step="15"
            value={item.restSeconds}
            onChange={(event) => onChange({ restSeconds: Number(event.target.value) || 0 })}
          />
        </label>
      </div>
      <label className="mt-2 block">
        <span className="field-label">Notas o RPE objetivo</span>
        <input
          className="input"
          value={item.notes || ''}
          placeholder="Ej. RPE 8, deja 2 reps en reserva"
          onChange={(event) => onChange({ notes: event.target.value })}
        />
      </label>
    </div>
  )
}
