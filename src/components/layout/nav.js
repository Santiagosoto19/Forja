import { CalendarDays, ChartLine, Dumbbell, House, StretchHorizontal, User } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Inicio', end: true, icon: 'home' },
  { to: '/entrenar', label: 'Entrenar', icon: 'dumbbell' },
  { to: '/rutinas', label: 'Rutinas', icon: 'calendar' },
  { to: '/ejercicios', label: 'Ejercicios', icon: 'stretch' },
  { to: '/analitica', label: 'Progreso', icon: 'chart' },
  { to: '/perfil', label: 'Perfil', icon: 'user' },
]

export const NAV_ICONS = {
  home: House,
  dumbbell: Dumbbell,
  calendar: CalendarDays,
  stretch: StretchHorizontal,
  chart: ChartLine,
  user: User,
}
