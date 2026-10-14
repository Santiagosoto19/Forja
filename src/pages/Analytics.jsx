import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { ChartLine } from 'lucide-react'
import { COMPOUND_EXERCISE_IDS, MUSCLE_LABELS } from '../data/seedExercises.js'
import {
  lastNMonths,
  lastNWeekStarts,
  muscleVolume,
  sessionsInLastDays,
  volumeByMonth,
  volumeByWeek,
} from '../lib/analytics.js'
import { chartColors, lineChartOptions, muscleChartColors } from '../lib/chartSetup.js'
import { estimated1RM, sessionExerciseVolume } from '../lib/formulas.js'
import { formatWeight, toDisplayWeight } from '../lib/units.js'
import { getExerciseById } from '../storage/store.js'
import { useAppState } from '../context/useAppState.js'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatWeekLabel(iso) {
  const [, month, day] = iso.split('-')
  return `${Number(day)} ${MONTHS_SHORT[Number(month) - 1]}`
}

function formatMonthLabel(yyyyMm) {
  const [year, month] = yyyyMm.split('-')
  return `${MONTHS_SHORT[Number(month) - 1]} ${year}`
}

function accumulate(state) {
  const volumeByExercise = new Map()
  const oneRmByExercise = new Map()

  for (const session of state.sessions) {
    for (const entry of session.entries || []) {
      const volume = sessionExerciseVolume(entry.sets || [])
      volumeByExercise.set(entry.exerciseId, (volumeByExercise.get(entry.exerciseId) || 0) + volume)
      for (const set of entry.sets || []) {
        if (!set.completed) continue
        const rm = estimated1RM(set.weightKg, set.reps)
        const prev = oneRmByExercise.get(entry.exerciseId) || 0
        if (rm > prev) oneRmByExercise.set(entry.exerciseId, rm)
      }
    }
  }

  return { volumeByExercise, oneRmByExercise }
}

const barOptions = {
  ...lineChartOptions,
  plugins: {
    ...lineChartOptions.plugins,
    tooltip: {
      ...lineChartOptions.plugins.tooltip,
      callbacks: {
        label: (item) => `${Math.round(item.parsed.y)} kg·reps`,
      },
    },
  },
}

export default function Analytics() {
  const { state } = useAppState()
  const hasSessionData = state.sessions.some((session) =>
    session.entries?.some((entry) => entry.sets?.some((set) => set.completed)),
  )
  const hasWeight = (state.bodyLogs || []).length >= 2

  if (!hasSessionData && !hasWeight) {
    return (
      <div className="space-y-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-title">
          <ChartLine className="h-6 w-6 text-primary" />
          Progreso
        </h1>
        <EmptyState
          title="Todavía no hay datos"
          description="Completa series en Entrenar o registra peso en Perfil para ver gráficos."
        />
      </div>
    )
  }

  const weeks = lastNWeekStarts(8)
  const weekTotals = Object.fromEntries(volumeByWeek(state.sessions).map((row) => [row.week, row.volume]))
  const weekly = weeks.map((week) => weekTotals[week] || 0)

  const months = lastNMonths(6)
  const monthTotals = Object.fromEntries(volumeByMonth(state.sessions).map((row) => [row.month, row.volume]))
  const monthly = months.map((month) => monthTotals[month] || 0)

  const recent = sessionsInLastDays(state.sessions, 7)
  const donutRows = muscleVolume(recent, state.exercises)
  const weightLogs = [...(state.bodyLogs || [])].sort((a, b) => a.date.localeCompare(b.date))
  const { volumeByExercise, oneRmByExercise } = accumulate(state)
  const top3 = [...volumeByExercise.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-title">
          <ChartLine className="h-6 w-6 text-primary" />
          Progreso
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Volumen de series completadas, peso corporal y grupos musculares de la última semana.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold text-title">Peso corporal</h2>
          {hasWeight ? (
            <div className="h-64">
              <Line
                options={lineChartOptions}
                data={{
                  labels: weightLogs.map((log) => log.date),
                  datasets: [
                    {
                      label: 'Peso',
                      data: weightLogs.map((log) => toDisplayWeight(log.weightKg, state.user.weightUnit)),
                      borderColor: chartColors.primary,
                      backgroundColor: 'rgba(0, 240, 255, 0.12)',
                      fill: true,
                      tension: 0.35,
                      pointRadius: 3,
                      borderWidth: 2.5,
                    },
                  ],
                }}
              />
            </div>
          ) : (
            <EmptyState
              title="Sin historial de peso"
              description="Registra al menos dos pesos en Perfil."
            />
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-base font-semibold text-title">Volumen semanal</h2>
          {hasSessionData ? (
            <div className="h-64">
              <Bar
                options={barOptions}
                data={{
                  labels: weeks.map(formatWeekLabel),
                  datasets: [
                    {
                      label: 'Volumen',
                      data: weekly,
                      backgroundColor: 'rgba(0, 240, 255, 0.72)',
                      borderRadius: 8,
                    },
                  ],
                }}
              />
            </div>
          ) : (
            <EmptyState title="Sin volumen" description="Completa series para ver las últimas 8 semanas." />
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-base font-semibold text-title">Volumen mensual</h2>
          {hasSessionData ? (
            <div className="h-64">
              <Line
                options={barOptions}
                data={{
                  labels: months.map(formatMonthLabel),
                  datasets: [
                    {
                      label: 'Volumen',
                      data: monthly,
                      borderColor: chartColors.accent,
                      backgroundColor: 'rgba(37, 99, 235, 0.16)',
                      fill: true,
                      tension: 0.3,
                      pointRadius: 3,
                      borderWidth: 2.5,
                    },
                  ],
                }}
              />
            </div>
          ) : (
            <EmptyState title="Sin volumen" description="Completa series para ver el volumen mensual." />
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-base font-semibold text-title">Grupos musculares (7 días)</h2>
          {donutRows.length ? (
            <div className="h-64">
              <Doughnut
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '62%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: chartColors.tick, boxWidth: 12, font: { size: 11 } },
                    },
                    tooltip: {
                      callbacks: {
                        label: (item) =>
                          ` ${item.label}: ${Math.round(item.parsed)} kg·reps`,
                      },
                    },
                  },
                }}
                data={{
                  labels: donutRows.map((row) => MUSCLE_LABELS[row.muscleGroup] || row.muscleGroup),
                  datasets: [
                    {
                      data: donutRows.map((row) => row.volume),
                      backgroundColor: donutRows.map(
                        (row) => muscleChartColors[row.muscleGroup] || chartColors.primary,
                      ),
                      borderWidth: 2,
                      borderColor: chartColors.surface,
                    },
                  ],
                }}
              />
            </div>
          ) : (
            <EmptyState
              title="Sin datos esta semana"
              description="Completa series en los últimos 7 días para ver la dona."
            />
          )}
        </Card>
      </div>

      {top3.length ? (
        <Card>
          <h2 className="mb-3 text-base font-semibold text-title">Top 3 por volumen acumulado</h2>
          <ol className="space-y-3">
            {top3.map(([exerciseId, volume], index) => {
              const exercise = getExerciseById(state, exerciseId)
              return (
                <li key={exerciseId} className="flex items-center justify-between gap-3">
                  <span className="font-medium text-title">
                    {index + 1}. {exercise?.name || exerciseId}
                  </span>
                  <span className="text-sm text-secondary">{Math.round(volume)} kg·reps</span>
                </li>
              )
            })}
          </ol>
        </Card>
      ) : null}

      <Card>
        <h2 className="mb-3 text-base font-semibold text-title">1RM estimado de compuestos</h2>
        <ul className="space-y-3">
          {COMPOUND_EXERCISE_IDS.map((exerciseId) => {
            const exercise = getExerciseById(state, exerciseId)
            const rm = oneRmByExercise.get(exerciseId)
            return (
              <li key={exerciseId} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-title">{exercise?.name}</span>
                <span className="font-semibold text-secondary">
                  {rm ? formatWeight(rm, state.user.weightUnit) : 'Sin datos'}
                </span>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
