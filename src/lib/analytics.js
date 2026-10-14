import { sessionExerciseVolume } from './formulas.js'

export {
  activeStreak,
  badgeStates,
  completedWorkouts,
  earnedBadgeIds,
  hasPrHunter,
  levelProgress,
  muscleVolume,
  sessionsInLastDays,
  totalCompletedVolume,
  userLevel,
  weekCalories,
  BADGE_CATALOG,
} from './formulas.js'

function toLocalDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function startOfIsoWeek(value) {
  const date = toLocalDate(value)
  if (!date) return null
  const weekday = date.getDay()
  const offset = weekday === 0 ? -6 : 1 - weekday
  date.setDate(date.getDate() + offset)
  return date
}

function sessionWhen(session) {
  return session?.completedAt || session?.startedAt || null
}

function completedSetVolume(session) {
  return (session?.entries || []).reduce((sum, entry) => {
    return sum + sessionExerciseVolume(entry.sets || [])
  }, 0)
}

export function lastNWeekStarts(count, fromDate = new Date()) {
  const monday = startOfIsoWeek(fromDate)
  if (!monday) return []
  const weeks = []
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(monday)
    date.setDate(date.getDate() - i * 7)
    weeks.push(toISODate(date))
  }
  return weeks
}

export function lastNMonths(count, fromDate = new Date()) {
  const months = []
  const year = fromDate.getFullYear()
  const month = fromDate.getMonth()
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(year, month - i, 1)
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

export function volumeByWeek(sessions = []) {
  const totals = new Map()
  for (const session of sessions) {
    const when = sessionWhen(session)
    if (!when) continue
    const monday = startOfIsoWeek(when)
    if (!monday) continue
    const key = toISODate(monday)
    totals.set(key, (totals.get(key) || 0) + completedSetVolume(session))
  }
  return [...totals.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, volume]) => ({ week, volume }))
}

export function volumeByMonth(sessions = []) {
  const totals = new Map()
  for (const session of sessions) {
    const when = sessionWhen(session)
    if (!when) continue
    const date = toLocalDate(when)
    if (!date) continue
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    totals.set(key, (totals.get(key) || 0) + completedSetVolume(session))
  }
  return [...totals.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, volume]) => ({ month, volume }))
}

export function weightSeries(bodyLogs = []) {
  return [...bodyLogs]
    .filter((log) => log?.date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      date: log.date,
      weightKg: Number(log.weightKg) || 0,
    }))
}
