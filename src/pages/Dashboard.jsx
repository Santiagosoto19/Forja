import { lazy, Suspense } from 'react'
import { Flame, House, Trophy, Zap } from 'lucide-react'
import {
  activeStreak,
  bmi,
  bmiCategory,
  completedWorkouts,
  latestWeightKg,
  muscleVolume,
  sessionsInLastDays,
  userLevel,
  weekCalories,
} from '../lib/formulas.js'
import { formatWeight } from '../lib/units.js'
import { suggestedDayId, sortedDays } from '../storage/store.js'
import { useAppState } from '../context/useAppState.js'
import MetricCard from '../components/dashboard/MetricCard.jsx'
import TodayCard from '../components/dashboard/TodayCard.jsx'
import Card from '../components/ui/Card.jsx'
import { ChartSkeleton } from '../components/ui/Skeleton.jsx'

const WeightChart = lazy(() => import('../components/dashboard/WeightChart.jsx'))
const MuscleWeek = lazy(() => import('../components/dashboard/MuscleWeek.jsx'))

export default function Dashboard() {
  const { state } = useAppState()
  const { user, bodyLogs, sessions, exercises } = state
  const weightKg = latestWeightKg(bodyLogs)
  const imc = bmi(weightKg, user.heightCm)
  const nextDayId = suggestedDayId(state)
  const nextDay = sortedDays(state).find((day) => day.id === nextDayId)
  const workouts = completedWorkouts(sessions)
  const streak = activeStreak(sessions)
  const level = userLevel(workouts)
  const kcal = weekCalories(sessions, { weightKg })
  const donutRows = muscleVolume(sessionsInLastDays(sessions, 7), exercises).slice(0, 6)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Forja</p>
        <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-title">
          <House className="h-7 w-7 text-primary" />
          Hola, {user.name || 'atleta'}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Entrenos" value={String(workouts)} hint="sesiones completadas" icon={Zap} />
        <MetricCard label="Racha" value={`${streak}`} hint="días seguidos" icon={Flame} />
        <MetricCard label="Kcal semana" value={kcal ? String(kcal) : '—'} hint="estimación" />
        <MetricCard label="Nivel" value={String(level)} hint={`${workouts % 5}/5 al siguiente`} icon={Trophy} />
      </div>

      <TodayCard day={nextDay} />

      <Suspense fallback={<ChartSkeleton className="h-64" />}>
        <WeightChart logs={bodyLogs} unit={user.weightUnit} />
      </Suspense>

      <Suspense
        fallback={
          <Card>
            <div className="skeleton-pulse h-40 rounded-[14px] bg-border/80" />
          </Card>
        }
      >
        <MuscleWeek rows={donutRows} />
      </Suspense>

      <p className="text-center text-xs text-secondary">
        Peso {weightKg ? formatWeight(weightKg, user.weightUnit) : 'sin registro'}
        {imc ? ` · IMC ${imc.toFixed(1)} (${bmiCategory(imc)})` : ''}
      </p>
    </div>
  )
}
