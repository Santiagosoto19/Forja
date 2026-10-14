import { ChevronDown, ChevronUp, Dumbbell, Pencil, Trash2 } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'

export default function DayEditor({
  day,
  expanded,
  isFirst,
  isLast,
  hasOpen,
  onSelect,
  onRename,
  onDelete,
  onMove,
  onTrain,
  children,
}) {
  return (
    <section className="card-surface overflow-hidden rounded-[14px] transition-transform duration-150 hover:scale-[1.01]">
      <div className="flex items-center gap-2 p-4">
        <div className="flex flex-col">
          <button
            type="button"
            aria-label="Subir día"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            className="rounded-md p-0.5 text-secondary transition-colors hover:bg-canvas disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Bajar día"
            disabled={isLast}
            onClick={() => onMove(1)}
            className="rounded-md p-0.5 text-secondary transition-colors hover:bg-canvas disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <h2 className="truncate text-lg font-semibold text-title">{day.name}</h2>
          <p className="text-sm text-secondary">{day.exercises.length} ejercicios</p>
        </button>
        {hasOpen ? <Badge variant="warning">Sesión abierta</Badge> : null}
        <button
          type="button"
          aria-label="Renombrar día"
          onClick={onRename}
          className="rounded-lg p-2 text-secondary transition-colors hover:bg-canvas hover:text-title"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Eliminar día"
          onClick={onDelete}
          className="rounded-lg p-2 text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {expanded ? (
        <div className="space-y-3 border-t border-border bg-canvas/50 p-4">
          {hasOpen ? (
            <p className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
              Los cambios aplican a la próxima sesión
            </p>
          ) : null}
          {children}
          <Button
            className="w-full sm:w-auto"
            onClick={onTrain}
            disabled={!day.exercises.length}
            title={!day.exercises.length ? 'Añade al menos un ejercicio' : undefined}
          >
            <Dumbbell className="h-4 w-4" />
            Entrenar este día
          </Button>
          {!day.exercises.length ? (
            <p className="text-sm text-secondary">Añade al menos un ejercicio para entrenar este día.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
