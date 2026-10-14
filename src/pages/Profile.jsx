import { useState } from 'react'
import { Medal, User } from 'lucide-react'
import { badgeStates, completedWorkouts, latestWeightKg, levelProgress } from '../lib/formulas.js'
import { toDisplayWeight } from '../lib/units.js'
import { useAppState } from '../context/useAppState.js'
import ProfileForm from '../components/profile/ProfileForm.jsx'
import WeightLogForm from '../components/profile/WeightLogForm.jsx'
import Card from '../components/ui/Card.jsx'

export default function Profile() {
  const { state, update } = useAppState()
  const latest = latestWeightKg(state.bodyLogs)
  const workouts = completedWorkouts(state.sessions)
  const progress = levelProgress(workouts)
  const badges = badgeStates(state.sessions)
  const [values, setValues] = useState({
    name: state.user.name,
    age: state.user.age,
    gender: state.user.gender,
    heightCm: state.user.heightCm,
    experienceLevel: state.user.experienceLevel,
    goal: state.user.goal,
    weightUnit: state.user.weightUnit,
  })

  function handleSubmit(form) {
    update((current) => ({
      ...current,
      user: {
        ...current.user,
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender,
        heightCm: Number(form.heightCm),
        experienceLevel: form.experienceLevel,
        goal: form.goal,
        weightUnit: form.weightUnit,
      },
    }))
    setValues(form)
  }

  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-title">
        <User className="h-6 w-6 text-primary" />
        Perfil
      </h1>

      <Card className="glow-cyan w-full">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Nivel</p>
            <p className="mt-1 text-4xl font-bold text-title">{progress.level}</p>
          </div>
          <p className="text-sm text-secondary">{progress.current}/{progress.nextAt} XP</p>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary shadow-[0_0_10px_#00F0FF]"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-secondary">{workouts} sesiones completadas · racha y asistencia</p>
      </Card>

      <Card className="w-full">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-title">
          <Medal className="h-4 w-4 text-primary" />
          Insignias
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {badges.map((badge) => (
            <li
              key={badge.id}
              className={`rounded-xl border px-3 py-3 ${
                badge.earned
                  ? 'border-primary/40 bg-primary/10 text-title'
                  : 'border-border bg-surface-2 text-secondary opacity-60'
              }`}
            >
              <p className="text-sm font-semibold">{badge.label}</p>
              <p className="mt-0.5 text-xs">{badge.earned ? 'Ganada' : `Bloqueada · ${badge.hint}`}</p>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Peso actual interno:{' '}
            {latest ? `${toDisplayWeight(latest, values.weightUnit)} ${values.weightUnit}` : 'sin registro'}.
          </p>
          <ProfileForm
            title="Biometría"
            values={values}
            onChange={setValues}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
          />
        </div>
        <WeightLogForm unit={state.user.weightUnit} logs={state.bodyLogs} />
      </div>
    </div>
  )
}
