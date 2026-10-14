import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAppState } from './context/useAppState.js'
import AppShell from './components/layout/AppShell.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Workout from './pages/Workout.jsx'
import Routines from './pages/Routines.jsx'
import Profile from './pages/Profile.jsx'
import { PageSkeleton } from './components/ui/Skeleton.jsx'

const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const Exercises = lazy(() => import('./pages/Exercises.jsx'))

function RequireOnboarding() {
  const { state } = useAppState()
  if (!state.user.onboardingComplete) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

export default function App() {
  const { state } = useAppState()

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route
          path="/onboarding"
          element={state.user.onboardingComplete ? <Navigate to="/" replace /> : <Onboarding />}
        />
        <Route element={<RequireOnboarding />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/entrenar" element={<Workout />} />
            <Route path="/entrenar/:dayId" element={<Workout />} />
            <Route path="/rutinas" element={<Routines />} />
            <Route path="/ejercicios" element={<Exercises />} />
            <Route path="/analitica" element={<Analytics />} />
            <Route path="/perfil" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
