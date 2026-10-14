import { Doughnut } from 'react-chartjs-2'
import { chartColors, muscleChartColors } from '../../lib/chartSetup.js'
import { MUSCLE_LABELS } from '../../data/seedExercises.js'
import Card from '../ui/Card.jsx'

export default function MuscleWeek({ rows = [] }) {
  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold text-title">Grupos musculares (7 días)</h2>
      {rows.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="mx-auto h-44 w-44">
            <Doughnut
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: { legend: { display: false } },
              }}
              data={{
                labels: rows.map((row) => MUSCLE_LABELS[row.muscleGroup] || row.muscleGroup),
                datasets: [
                  {
                    data: rows.map((row) => row.volume),
                    backgroundColor: rows.map(
                      (row) => muscleChartColors[row.muscleGroup] || chartColors.primary,
                    ),
                    borderWidth: 2,
                    borderColor: chartColors.surface,
                  },
                ],
              }}
            />
          </div>
          <ul className="space-y-2">
            {rows.map((row) => {
              const max = rows[0]?.volume || 1
              return (
                <li key={row.muscleGroup}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold text-title">
                      {MUSCLE_LABELS[row.muscleGroup] || row.muscleGroup}
                    </span>
                    <span className="text-secondary">{Math.round(row.volume)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(8, (row.volume / max) * 100)}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-secondary">Completa series esta semana para ver el mapa muscular.</p>
      )}
    </Card>
  )
}
