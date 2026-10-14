import { Line } from 'react-chartjs-2'
import { toDisplayWeight, unitLabel } from '../../lib/units.js'
import { chartColors, lineChartOptions } from '../../lib/chartSetup.js'
import Card from '../ui/Card.jsx'
import { ChartSkeleton } from '../ui/Skeleton.jsx'

export default function WeightChart({ logs, unit }) {
  const data = [...(logs || [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      date: log.date,
      peso: toDisplayWeight(log.weightKg, unit),
    }))

  const options = {
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      tooltip: {
        ...lineChartOptions.plugins.tooltip,
        callbacks: {
          label: (item) => `Peso: ${item.parsed.y} ${unitLabel(unit)}`,
        },
      },
    },
  }

  return (
    <Card className="h-full">
      <h2 className="mb-3 text-base font-semibold text-title">Evolución de peso</h2>
      {data.length < 2 ? (
        <div>
          <ChartSkeleton />
          <p className="mt-3 text-center text-sm text-secondary">
            Registra al menos dos pesos en Perfil para ver la gráfica.
          </p>
        </div>
      ) : (
        <div className="h-64">
          <Line
            options={options}
            data={{
              labels: data.map((row) => row.date),
              datasets: [
                {
                  label: 'Peso',
                  data: data.map((row) => row.peso),
                  borderColor: chartColors.primary,
                  backgroundColor: 'rgba(0, 240, 255, 0.12)',
                  fill: true,
                  tension: 0.35,
                  pointRadius: 3,
                  pointBackgroundColor: chartColors.primary,
                  borderWidth: 2.5,
                },
              ],
            }}
          />
        </div>
      )}
    </Card>
  )
}
