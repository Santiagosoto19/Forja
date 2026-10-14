import { useState } from 'react'
import { formatWeight, fromDisplayWeight, unitLabel } from '../../lib/units.js'
import { todayISO, upsertBodyLog } from '../../storage/store.js'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'

export default function WeightLogForm({ unit, logs }) {
  const [weight, setWeight] = useState('')
  const recent = [...(logs || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)

  function handleSubmit(event) {
    event.preventDefault()
    if (weight === '' || !Number.isFinite(Number(weight))) return
    upsertBodyLog(todayISO(), fromDisplayWeight(weight, unit))
    setWeight('')
  }

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold text-title">Registrar peso</h2>
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <input
          className="input"
          type="number"
          min="30"
          step="0.1"
          required
          placeholder={`Peso de hoy (${unitLabel(unit)})`}
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
        />
        <Button type="submit">Añadir hoy</Button>
      </form>
      <ul className="mt-4 space-y-2">
        {recent.map((log) => (
          <li key={log.id} className="flex items-center justify-between text-sm">
            <span className="text-secondary">{log.date}</span>
            <span className="font-semibold text-title">{formatWeight(log.weightKg, unit)}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
