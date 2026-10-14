import { MUSCLE_LABELS } from '../../data/seedExercises.js'
import Badge from '../ui/Badge.jsx'
import ExerciseThumb from './ExerciseThumb.jsx'

export default function ExerciseCard({ exercise, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(exercise)}
      className="card-surface flex flex-col overflow-hidden rounded-[14px] text-left transition-transform duration-150 hover:scale-[1.02]"
    >
      <ExerciseThumb src={exercise.imageUrl} alt="" className="h-32 w-full" />
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-title">{exercise.name}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          <Badge>{MUSCLE_LABELS[exercise.muscleGroup] || exercise.muscleGroup}</Badge>
          {exercise.equipment ? (
            <span className="truncate text-[11px] text-secondary">{exercise.equipment}</span>
          ) : null}
        </div>
      </div>
    </button>
  )
}
