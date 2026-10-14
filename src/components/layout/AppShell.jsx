import { Dumbbell } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import BottomNav from './BottomNav.jsx'

const PAGE_TITLES = {
  '/': 'Inicio',
  '/entrenar': 'Entrenar',
  '/rutinas': 'Rutinas',
  '/ejercicios': 'Ejercicios',
  '/analitica': 'Progreso',
  '/perfil': 'Perfil',
}

function pageTitle(pathname) {
  if (pathname.startsWith('/entrenar')) return 'Entrenar'
  return PAGE_TITLES[pathname] || 'GymTech'
}

export default function AppShell() {
  const location = useLocation()

  return (
    <div className="app-shell">
      <div className="border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">GymTech</p>
        <p className="mt-0.5 flex items-center gap-2 text-base font-bold text-title">
          <Dumbbell className="h-5 w-5 text-primary" />
          {pageTitle(location.pathname)}
        </p>
      </div>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:pb-10 md:pt-6">
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
