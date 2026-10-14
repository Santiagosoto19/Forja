import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MUSCLE_LABELS } from '../../data/seedExercises.js'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import Modal from '../ui/Modal.jsx'
import { exerciseInstructions } from './exerciseMedia.js'
import ExerciseHero from './ExerciseHero.jsx'

export default function ExerciseDetailModal({ open, exercise, onClose, days = [], onAddToDay }) {
  const [dayId, setDayId] = useState('')
  const [added, setAdded] = useState('')
  const firstDayId = days[0]?.id || ''

  useEffect(() => {
    setAdded('')
    setDayId(firstDayId)
  }, [exercise?.id, firstDayId, open])

  if (!exercise) return null

  const instructions = exerciseInstructions(exercise)
  const secondary = (exercise.secondaryMuscles || []).filter(Boolean).join(', ')

  function handleAdd() {
    if (!dayId) return
    onAddToDay?.(dayId, exercise)
    const day = days.find((item) => item.id === dayId)
    setAdded(day?.name || 'día')
  }

  return (
    <Modal
      open={open}
      title={exercise.name}
      onClose={onClose}
      className="max-h-[90dvh] max-w-lg overflow-y-auto"
      zClass="z-[60]"
    >
      <div className="space-y-3">
        <ExerciseHero imageUrl={exercise.imageUrl} gifUrl={exercise.gifUrl} name={exercise.name} />

        <div className="flex flex-wrap gap-1.5">
          <Badge>{MUSCLE_LABELS[exercise.muscleGroup] || exercise.muscleGroup}</Badge>
          {exercise.equipment ? <Badge variant="primary">{exercise.equipment}</Badge> : null}
        </div>

        {exercise.target ? (
          <p className="text-sm text-secondary">
            <span className="font-semibold text-title">Target: </span>
            {exercise.target}
          </p>
        ) : null}
        {secondary ? (
          <p className="text-sm text-secondary">
            <span className="font-semibold text-title">Músculo secundario: </span>
            {secondary}
          </p>
        ) : null}

        {instructions ? (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Instrucciones
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-secondary">{instructions}</p>
          </div>
        ) : null}

        {onAddToDay ? (
          days.length ? (
            <div className="border-t border-border pt-3">
              <p className="mb-2 text-sm font-semibold text-title">Añadir a un día</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  className="input"
                  value={dayId}
                  onChange={(event) => setDayId(event.target.value)}
                >
                  {days.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.name}
                    </option>
                  ))}
                </select>
                <Button onClick={handleAdd} disabled={!dayId}>
                  Añadir
                </Button>
              </div>
              {added ? (
                <p className="mt-2 text-xs text-success">Añadido a {added}.</p>
              ) : null}
            </div>
          ) : (
            <div className="border-t border-border pt-3">
              <Link to="/rutinas">
                <Button variant="secondary" className="w-full">
                  Ir a Rutinas
                </Button>
              </Link>
            </div>
          )
        ) : null}
      </div>
    </Modal>
  )
}
