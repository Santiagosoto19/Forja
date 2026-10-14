import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { createId } from '../lib/ids.js'
import { fromDisplayWeight } from '../lib/units.js'
import { todayISO } from '../storage/store.js'
import { useAppState } from '../context/useAppState.js'
import ProfileForm from '../components/profile/ProfileForm.jsx'

export default function Onboarding() {
  const navigate = useNavigate()
  const { state, update } = useAppState()
  const [values, setValues] = useState({
    name: state.user.name || '',
    age: state.user.age || '',
    gender: state.user.gender || 'male',
    heightCm: state.user.heightCm || '',
    experienceLevel: state.user.experienceLevel || 'beginner',
    goal: state.user.goal || 'hypertrophy',
    weightUnit: state.user.weightUnit || 'kg',
    weight: '',
  })

  function handleSubmit(form) {
    const weightKg = fromDisplayWeight(form.weight, form.weightUnit)
    update(
      (current) => ({
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
          onboardingComplete: true,
        },
        bodyLogs: [
          {
            id: createId('log'),
            date: todayISO(),
            weightKg,
          },
        ],
      }),
      { immediate: true },
    )
    navigate('/')
  }

  return (
    <div className="app-shell px-4 py-8">
      <div className="page-enter mx-auto max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">GymTech</p>
        <h1 className="mt-2 text-3xl font-bold text-title">Configura tu perfil de atleta</h1>
        <p className="mt-2 mb-6 text-secondary">
          Racha, asistencia y calorías de sesión. Sin membresías ni pagos: solo tu entrenamiento.
        </p>
        <ProfileForm
          title="Datos iniciales"
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          submitLabel="Empezar"
        />
      </div>
    </div>
  )
}
