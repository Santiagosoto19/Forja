import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { detectPrs, sessionExerciseVolume } from '../../lib/formulas.js'
import { celebrateExercise, celebratePr } from '../../lib/celebrate.js'
import {
  completeSession,
  getExerciseById,
  lastCompletedSets,
  previousSessions,
  updateSet,
} from '../../storage/store.js'
import { useAppState } from '../../context/useAppState.js'
import Button from '../ui/Button.jsx'
import ExerciseBlock from './ExerciseBlock.jsx'
import RestTimer from './RestTimer.jsx'
import PrToast from './PrToast.jsx'
import SessionProgress from './SessionProgress.jsx'

function prMessage(prs) {
  const parts = []
  if (prs.isWeightPr) parts.push('peso')
  if (prs.isVolumePr) parts.push('volumen')
  if (prs.isOneRmPr) parts.push('1RM')
  if (!parts.length) return null
  return `¡Nuevo PR de ${parts.join(', ')}!`
}

export default function SessionView({ day, session }) {
  const navigate = useNavigate()
  const { state } = useAppState()
  const [toast, setToast] = useState(null)
  const [rest, setRest] = useState(null)
  const celebratedExercises = useRef(new Set())
  const celebratedPrs = useRef(new Set())
  const unit = state.user.weightUnit

  const templates = useMemo(
    () => Object.fromEntries(day.exercises.map((item) => [item.id, item])),
    [day],
  )

  function handleChange(routineExerciseId, setId, patch) {
    updateSet(session.id, routineExerciseId, setId, patch)
  }

  function handleToggle(entry, template, set, completed) {
    const patch = {
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    }
    const nextState = updateSet(session.id, entry.routineExerciseId, set.id, patch)
    const nextSession = nextState.sessions.find((item) => item.id === session.id)
    const nextEntry = nextSession.entries.find((item) => item.routineExerciseId === entry.routineExerciseId)
    const nextSet = nextEntry.sets.find((item) => item.id === set.id)

    if (!completed) return

    const history = previousSessions(nextState, session.id)
    const hasHistory = lastCompletedSets(nextState, entry.exerciseId, session.id).length > 0
    const currentSessionOtherSets = nextEntry.sets.filter((item) => item.id !== nextSet.id)
    const prs = detectPrs({
      exerciseId: entry.exerciseId,
      currentSet: nextSet,
      currentSessionVolume: sessionExerciseVolume(nextEntry.sets),
      previousSessions: history,
      currentSessionOtherSets,
    })
    const isPr = hasHistory && (prs.isWeightPr || prs.isVolumePr || prs.isOneRmPr)
    if (isPr && !celebratedPrs.current.has(nextSet.id)) {
      celebratedPrs.current.add(nextSet.id)
      const message = prMessage(prs)
      setToast(message)
      celebratePr()
      window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2800)
    }

    const allDone = nextEntry.sets.every((item) => item.completed)
    if (allDone && !celebratedExercises.current.has(entry.routineExerciseId)) {
      celebratedExercises.current.add(entry.routineExerciseId)
      if (!isPr) celebrateExercise()
    }

    setRest({ key: nextSet.id, seconds: template.restSeconds })
  }

  function handleFinish() {
    completeSession(session.id)
    navigate('/')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Sesión en curso</p>
          <h1 className="text-2xl font-bold text-title">{day.name}</h1>
        </div>
        <Button variant="success" size="lg" className="w-full sm:w-auto" onClick={handleFinish}>
          <Check className="h-4 w-4" />
          Finalizar sesión
        </Button>
      </div>

      <SessionProgress session={session} />

      {session.entries.map((entry) => {
        const template = templates[entry.routineExerciseId]
        if (!template) return null
        return (
          <ExerciseBlock
            key={entry.routineExerciseId}
            exercise={getExerciseById(state, entry.exerciseId)}
            template={template}
            entry={entry}
            lastSets={lastCompletedSets(state, entry.exerciseId, session.id)}
            unit={unit}
            onChangeSet={(setId, patch) => handleChange(entry.routineExerciseId, setId, patch)}
            onToggleComplete={(set, completed) => handleToggle(entry, template, set, completed)}
          />
        )
      })}

      <PrToast message={toast} onClose={() => setToast(null)} />
      {rest?.seconds ? (
        <RestTimer
          key={rest.key}
          seconds={rest.seconds}
          onClose={() => setRest(null)}
        />
      ) : null}
    </div>
  )
}
