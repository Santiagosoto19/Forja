import { goalProgressText, weeklyProgressRate } from '../../lib/formulas.js'
import Card from '../ui/Card.jsx'

export default function GoalProgress({ logs, goal }) {
  const rate = weeklyProgressRate(logs)
  const text = logs?.length >= 2 ? goalProgressText(goal, rate) : 'Añade al menos dos registros de peso para estimar tu ritmo.'

  return (
    <Card>
      <h2 className="text-base font-semibold text-title">Progreso hacia el objetivo</h2>
      <p className="mt-3 text-3xl font-bold text-title">
        {logs?.length >= 2 ? `${rate >= 0 ? '+' : ''}${rate.toFixed(2)}` : '—'}
        <span className="ml-1 text-sm font-medium text-secondary">kg/semana</span>
      </p>
      <p className="mt-2 text-sm text-secondary">{text}</p>
    </Card>
  )
}
