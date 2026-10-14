import { Link } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'

export default function TodayCard({ day }) {
  if (!day) {
    return (
      <Card className="w-full">
        <h2 className="text-base font-semibold text-title">Hoy toca</h2>
        <p className="mt-2 text-sm text-secondary">No hay un día de rutina configurado.</p>
      </Card>
    )
  }

  return (
    <Card className="glow-cyan flex w-full flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Siguiente sesión</p>
        <h2 className="mt-1 text-2xl font-bold text-title">{day.name}</h2>
        <p className="mt-1 text-sm text-secondary">{day.exercises.length} ejercicios en la plantilla</p>
      </div>
      <Link to={`/entrenar/${day.id}`} className="block w-full">
        <Button size="lg" className="w-full">
          <Dumbbell className="h-5 w-5" />
          Entrenar ahora
        </Button>
      </Link>
    </Card>
  )
}
