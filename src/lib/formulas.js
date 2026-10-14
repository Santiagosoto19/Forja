const ACTIVITY = {
  beginner: 1.375,
  intermediate: 1.55,
  advanced: 1.725,
}

const GOAL_CALORIE_MULT = {
  hypertrophy: 1.12,
  strength: 1.1,
  fat_loss: 0.8,
  recomp: 1,
  maintenance: 1,
}

const GOAL_PROTEIN_G_PER_KG = {
  hypertrophy: 2.0,
  strength: 1.8,
  fat_loss: 2.2,
  recomp: 2.2,
  maintenance: 1.8,
}

export function bmi(weightKg, heightCm) {
  const w = Number(weightKg)
  const h = Number(heightCm) / 100
  if (!w || !h) return 0
  return w / (h * h)
}

export function bmiCategory(value) {
  if (!Number.isFinite(value) || value <= 0) return '—'
  if (value < 18.5) return 'Bajo peso'
  if (value < 25) return 'Normal'
  if (value < 30) return 'Sobrepeso'
  return 'Obesidad'
}

export function bmrMifflin({ weightKg, heightCm, age, gender }) {
  const base = 10 * Number(weightKg) + 6.25 * Number(heightCm) - 5 * Number(age)
  if (gender === 'male') return base + 5
  if (gender === 'female') return base - 161
  return (base + 5 + base - 161) / 2
}

export function tdee({ weightKg, heightCm, age, gender, experienceLevel }) {
  const bmr = bmrMifflin({ weightKg, heightCm, age, gender })
  const factor = ACTIVITY[experienceLevel] ?? ACTIVITY.intermediate
  return bmr * factor
}

export function macros({ tdee: tdeeKcal, weightKg, goal }) {
  const calorieTarget = Number(tdeeKcal) * (GOAL_CALORIE_MULT[goal] ?? 1)
  const protein = Math.round(Number(weightKg) * (GOAL_PROTEIN_G_PER_KG[goal] ?? 1.8))
  const fat = Math.round((calorieTarget * 0.25) / 9)
  const carbs = Math.round((calorieTarget - protein * 4 - fat * 9) / 4)
  return {
    calories: Math.round(calorieTarget),
    protein,
    carbs,
    fat,
  }
}

export function epley1RM(weight, reps) {
  const w = Number(weight)
  const r = Number(reps)
  if (!w || !r) return 0
  return w * (1 + r / 30)
}

export function brzycki1RM(weight, reps) {
  const w = Number(weight)
  const r = Number(reps)
  if (!w || !r) return 0
  if (r >= 37) return null
  return w * (36 / (37 - r))
}

export function estimated1RM(weight, reps) {
  const w = Number(weight)
  const r = Number(reps)
  if (!w || !r) return 0
  if (r === 1) return w
  const epley = epley1RM(w, r)
  const brzycki = brzycki1RM(w, r)
  const valid = [epley, brzycki].filter((v) => v != null && Number.isFinite(v))
  if (!valid.length) return epley
  return valid.reduce((sum, v) => sum + v, 0) / valid.length
}

export function setVolume(weightKg, reps) {
  return (Number(weightKg) || 0) * (Number(reps) || 0)
}

export function sessionExerciseVolume(sets = []) {
  return sets
    .filter((set) => set.completed)
    .reduce((sum, set) => sum + setVolume(set.weightKg, set.reps), 0)
}

function previousCompletedSets(previousSessions, exerciseId) {
  const sets = []
  for (const session of previousSessions || []) {
    for (const entry of session.entries || []) {
      if (entry.exerciseId !== exerciseId) continue
      for (const set of entry.sets || []) {
        if (set.completed) sets.push(set)
      }
    }
  }
  return sets
}

function previousMaxVolume(previousSessions, exerciseId) {
  let max = 0
  for (const session of previousSessions || []) {
    for (const entry of session.entries || []) {
      if (entry.exerciseId !== exerciseId) continue
      const volume = sessionExerciseVolume(entry.sets || [])
      if (volume > max) max = volume
    }
  }
  return max
}

export function detectPrs({
  exerciseId,
  currentSet,
  currentSessionVolume,
  previousSessions,
  currentSessionOtherSets = [],
}) {
  const prevSets = previousCompletedSets(previousSessions, exerciseId)
  const otherCompleted = (currentSessionOtherSets || []).filter((set) => set.completed)
  const baselineSets = [...prevSets, ...otherCompleted]
  const prevMaxWeight = baselineSets.reduce((max, set) => Math.max(max, Number(set.weightKg) || 0), 0)
  const prevMaxOneRm = baselineSets.reduce((max, set) => {
    const rm = estimated1RM(set.weightKg, set.reps)
    return Math.max(max, rm || 0)
  }, 0)
  const historyMaxVolume = previousMaxVolume(previousSessions, exerciseId)
  const volumeWithoutThisSet = sessionExerciseVolume(otherCompleted)
  const sessionVolume = Number(currentSessionVolume) || 0

  const weight = Number(currentSet?.weightKg) || 0
  const currentRm = estimated1RM(currentSet?.weightKg, currentSet?.reps)
  const completed = Boolean(currentSet?.completed)

  return {
    isWeightPr: completed && weight > prevMaxWeight,
    isVolumePr:
      completed && sessionVolume > historyMaxVolume && volumeWithoutThisSet <= historyMaxVolume,
    isOneRmPr: completed && currentRm > prevMaxOneRm,
  }
}

export function weeklyProgressRate(bodyLogs = []) {
  if (!bodyLogs || bodyLogs.length < 2) return 0
  const sorted = [...bodyLogs].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const days =
    (new Date(`${last.date}T00:00:00`).getTime() - new Date(`${first.date}T00:00:00`).getTime()) /
    (1000 * 60 * 60 * 24)
  if (days <= 0) return 0
  return ((last.weightKg - first.weightKg) / days) * 7
}

export function goalProgressText(goal, kgPerWeek) {
  const rate = Number(kgPerWeek) || 0
  const abs = Math.abs(rate)
  const formatted = abs.toFixed(2)

  if (goal === 'hypertrophy' || goal === 'strength') {
    if (rate > 0.05) return `Vas subiendo ~${formatted} kg/semana. Ritmo adecuado para ganar peso.`
    if (rate < -0.05) return `Estás bajando ~${formatted} kg/semana. Revisa calorías si buscas subir de peso.`
    return 'Peso estable. Si tu objetivo es ganar músculo, un ligero superávit puede ayudar.'
  }

  if (goal === 'fat_loss') {
    if (rate < -0.05) return `Vas bajando ~${formatted} kg/semana. Ritmo adecuado para perder grasa.`
    if (rate > 0.05) return `Estás subiendo ~${formatted} kg/semana. Ajusta calorías si buscas perder grasa.`
    return 'Peso estable. Para perder grasa, un ligero déficit puede ayudar.'
  }

  if (abs < 0.15) {
    const sign = rate >= 0 ? '+' : ''
    return `Peso relativamente estable (${sign}${rate.toFixed(2)} kg/semana). Alineado con mantener.`
  }
  if (rate > 0) return `Subiendo ~${formatted} kg/semana. Si buscas mantener, revisa el superávit.`
  return `Bajando ~${formatted} kg/semana. Si buscas mantener, revisa el déficit.`
}

export function latestWeightKg(bodyLogs = []) {
  if (!bodyLogs.length) return 0
  const sorted = [...bodyLogs].sort((a, b) => a.date.localeCompare(b.date))
  return Number(sorted[sorted.length - 1].weightKg) || 0
}

export const SESSION_MET = 6
export const DEFAULT_REST_SECONDS = 90
const WORK_MINUTES_PER_SET = 0.75

export function countCompletedSets(session) {
  return (session?.entries || []).reduce((sum, entry) => {
    return sum + (entry.sets || []).filter((set) => set.completed).length
  }, 0)
}

export function estimatedSessionMinutes(session, restSeconds = DEFAULT_REST_SECONDS) {
  const sets = countCompletedSets(session)
  if (!sets) return 0
  const rest = Number(restSeconds) > 0 ? Number(restSeconds) : DEFAULT_REST_SECONDS
  return sets * (rest / 60) + sets * WORK_MINUTES_PER_SET
}

export function estimatedSessionKcal(session, user = {}, restSeconds = DEFAULT_REST_SECONDS) {
  const hours = estimatedSessionMinutes(session, restSeconds) / 60
  const kg = Number(user.weightKg) || 0
  if (!hours || !kg) return 0
  return Math.round(SESSION_MET * kg * hours)
}

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

function sessionWhen(session) {
  return session?.completedAt || session?.startedAt || null
}

function shiftLocalDay(date, delta) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  next.setDate(next.getDate() + delta)
  return next
}

function completedSetVolume(session) {
  return (session?.entries || []).reduce((sum, entry) => {
    return sum + sessionExerciseVolume(entry.sets || [])
  }, 0)
}

export function muscleVolume(sessions = [], exercises = []) {
  const byExercise = Object.fromEntries((exercises || []).map((exercise) => [exercise.id, exercise]))
  const totals = new Map()
  for (const session of sessions) {
    for (const entry of session.entries || []) {
      const volume = (entry.sets || [])
        .filter((set) => set.completed)
        .reduce((sum, set) => sum + setVolume(set.weightKg, set.reps), 0)
      if (!volume) continue
      const muscleGroup = byExercise[entry.exerciseId]?.muscleGroup || 'core'
      totals.set(muscleGroup, (totals.get(muscleGroup) || 0) + volume)
    }
  }
  return [...totals.entries()]
    .map(([muscleGroup, volume]) => ({ muscleGroup, volume }))
    .sort((a, b) => b.volume - a.volume)
}

export function sessionsInLastDays(sessions = [], days = 7, fromDate = new Date()) {
  const from = fromDate.getTime() - days * 24 * 60 * 60 * 1000
  return sessions.filter((session) => {
    const when = sessionWhen(session)
    if (!when) return false
    const time = new Date(when).getTime()
    return Number.isFinite(time) && time >= from
  })
}

export function completedWorkouts(sessions = []) {
  return (sessions || []).filter((session) => Boolean(session?.completedAt)).length
}

export function userLevel(completedCount) {
  const n = Number(completedCount) || 0
  return 1 + Math.floor(n / 5)
}

export function levelProgress(completedCount) {
  const n = Number(completedCount) || 0
  const into = n % 5
  return {
    level: userLevel(n),
    current: into,
    nextAt: 5,
    pct: (into / 5) * 100,
  }
}

export function activeStreak(sessions = [], fromDate = new Date()) {
  const dates = new Set()
  for (const session of sessions || []) {
    if (!session?.completedAt) continue
    const day = toLocalDate(session.completedAt)
    if (day) dates.add(toISODate(day))
  }
  if (!dates.size) return 0

  const today = toLocalDate(fromDate)
  if (!today) return 0
  let cursor = today
  if (!dates.has(toISODate(cursor))) {
    cursor = shiftLocalDay(today, -1)
    if (!dates.has(toISODate(cursor))) return 0
  }

  let streak = 0
  while (dates.has(toISODate(cursor))) {
    streak += 1
    cursor = shiftLocalDay(cursor, -1)
  }
  return streak
}

export function weekCalories(sessions = [], user = {}, fromDate = new Date()) {
  return sessionsInLastDays(sessions, 7, fromDate)
    .filter((session) => session?.completedAt)
    .reduce((sum, session) => sum + estimatedSessionKcal(session, user), 0)
}

export const BADGE_CATALOG = [
  { id: 'primera_sesion', label: 'Primera sesión', hint: 'Completa tu primer entreno' },
  { id: 'racha_3', label: 'Racha 3', hint: 'Entrena 3 días seguidos' },
  { id: 'racha_7', label: 'Racha 7', hint: 'Entrena 7 días seguidos' },
  { id: 'pr_hunter', label: 'Cazador de PRs', hint: 'Supera un peso anterior' },
  { id: 'volumen_10k', label: 'Volumen 10k', hint: 'Acumula 10.000 kg·reps' },
]

export function hasPrHunter(sessions = []) {
  const maxByExercise = new Map()
  const chronological = [...(sessions || [])].sort((a, b) => {
    const ta = new Date(a.completedAt || a.startedAt || 0).getTime()
    const tb = new Date(b.completedAt || b.startedAt || 0).getTime()
    return ta - tb
  })
  for (const session of chronological) {
    for (const entry of session.entries || []) {
      for (const set of entry.sets || []) {
        if (!set.completed) continue
        const weight = Number(set.weightKg) || 0
        if (!weight) continue
        const prev = maxByExercise.get(entry.exerciseId) || 0
        if (prev > 0 && weight > prev) return true
        if (weight > prev) maxByExercise.set(entry.exerciseId, weight)
      }
    }
  }
  return false
}

export function totalCompletedVolume(sessions = []) {
  return (sessions || []).reduce((sum, session) => sum + completedSetVolume(session), 0)
}

export function earnedBadgeIds(sessions = [], fromDate = new Date()) {
  const n = completedWorkouts(sessions)
  const streak = activeStreak(sessions, fromDate)
  const ids = []
  if (n >= 1) ids.push('primera_sesion')
  if (streak >= 3) ids.push('racha_3')
  if (streak >= 7) ids.push('racha_7')
  if (hasPrHunter(sessions)) ids.push('pr_hunter')
  if (totalCompletedVolume(sessions) >= 10000) ids.push('volumen_10k')
  return ids
}

export function badgeStates(sessions = [], fromDate = new Date()) {
  const earned = new Set(earnedBadgeIds(sessions, fromDate))
  return BADGE_CATALOG.map((badge) => ({
    ...badge,
    earned: earned.has(badge.id),
  }))
}
