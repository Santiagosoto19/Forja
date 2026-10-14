import { useLayoutEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ensureTodaySession, findOpenSessionToday, sortedDays, suggestedDayId } from '../storage/store.js'
import { useAppState } from '../context/useAppState.js'
import SessionView from '../components/workout/SessionView.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'

export default function Workout() {
  const { dayId } = useParams()
  const { state } = useAppState()
  const days = sortedDays(state)
  const resolvedDayId = dayId || suggestedDayId(state)
  const day = days.find((item) => item.id === resolvedDayId)

  useLayoutEffect(() => {
    if (dayId && day) ensureTodaySession(dayId)
  }, [dayId, day])

  if (!dayId && resolvedDayId) {
    return <Navigate to={`/entrenar/${resolvedDayId}`} replace />
  }

  if (!day) {
    return (
      <EmptyState
        title="No hay día de rutina"
        description="Ese día no está en la plantilla. Puede haberse eliminado. Elige otro en Rutinas."
      />
    )
  }

  const session = findOpenSessionToday(state, day.id)
  if (!session) {
    return <Skeleton lines={6} className="mt-2" />
  }

  return <SessionView day={day} session={session} />
}
