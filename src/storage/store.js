import { createId } from '../lib/ids.js'
import { normalizeExercise } from '../lib/exerciseFields.js'
import { seedExercises } from '../data/seedExercises.js'
import { seedRoutine } from '../data/seedRoutine.js'

export const STORAGE_KEY = 'rutina_gym.v1'
export const EMERGENCY_KEY = 'rutina_gym.emergency'
export const SCHEMA_VERSION = 1

const listeners = new Set()
let current = null
let persistEnabled = false
let persistTimer = null
let persistInFlight = null

export function todayISO(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function createInitialState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    user: {
      id: createId('user'),
      name: '',
      age: null,
      gender: 'male',
      heightCm: null,
      experienceLevel: 'beginner',
      goal: 'hypertrophy',
      weightUnit: 'kg',
      onboardingComplete: false,
    },
    bodyLogs: [],
    exercises: seedExercises.map((exercise) => normalizeExercise(exercise)),
    routine: structuredClone(seedRoutine),
    sessions: [],
  }
}

export function applyUpdate(state, updater) {
  return updater(state)
}

function canUseSession() {
  return typeof sessionStorage !== 'undefined'
}

function writeEmergencyCache(state) {
  if (!canUseSession()) return
  try {
    sessionStorage.setItem(EMERGENCY_KEY, JSON.stringify(state))
  } catch {
    /* quota / private mode */
  }
}

function clearEmergencyCache() {
  if (!canUseSession()) return
  try {
    sessionStorage.removeItem(EMERGENCY_KEY)
  } catch {
    /* ignore */
  }
}

function notify(state) {
  listeners.forEach((fn) => fn(state))
}

export function enablePersist() {
  persistEnabled = true
}

export function disablePersist() {
  persistEnabled = false
  if (persistTimer) {
    clearTimeout(persistTimer)
    persistTimer = null
  }
}

async function putState(state) {
  const res = await fetch('/api/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })
  if (!res.ok) {
    throw new Error(`PUT /api/state ${res.status}`)
  }
  clearEmergencyCache()
}

export function persistNow(state = current) {
  if (!persistEnabled || !state) return persistInFlight
  if (persistTimer) {
    clearTimeout(persistTimer)
    persistTimer = null
  }
  persistInFlight = putState(state).catch(() => {
    writeEmergencyCache(state)
  })
  return persistInFlight
}

function schedulePersist(state, immediate) {
  if (!persistEnabled) return
  if (immediate) {
    persistNow(state)
    return
  }
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    persistTimer = null
    persistNow(state)
  }, 250)
}

export function hydrate(state) {
  current = state
  notify(current)
  return current
}

export function getState() {
  if (!current) {
    current = createInitialState()
  }
  return current
}

export const get = getState

export function update(updater, options = {}) {
  const prev = getState()
  const next = applyUpdate(prev, updater)
  current = next
  notify(next)
  schedulePersist(next, options.immediate === true)
  return next
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getExerciseById(state, exerciseId) {
  return (state.exercises || []).find((exercise) => exercise.id === exerciseId) || null
}

export function sortedDays(state) {
  return [...(state.routine?.days || [])].sort((a, b) => a.order - b.order)
}

export function suggestedDayId(state) {
  const days = sortedDays(state)
  if (!days.length) return null
  const dayIds = new Set(days.map((day) => day.id))
  const sessions = (state.sessions || []).filter((session) => dayIds.has(session.dayId))
  if (!sessions.length) return days[0].id

  const openSessions = sessions.filter((session) => session.completedAt == null)
  if (openSessions.length) {
    const mostRecentOpen = [...openSessions].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )[0]
    return mostRecentOpen.dayId
  }

  const last = [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )[0]
  const index = days.findIndex((day) => day.id === last.dayId)
  if (index === -1) return days[0].id
  return days[(index + 1) % days.length].id
}

export function lastCompletedSets(state, exerciseId, excludeSessionId) {
  const sessions = [...state.sessions]
    .filter((session) => session.id !== excludeSessionId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

  for (const session of sessions) {
    const entry = (session.entries || []).find((item) => item.exerciseId === exerciseId)
    if (!entry) continue
    const done = (entry.sets || []).filter((set) => set.completed)
    if (done.length) return done
  }
  return []
}

function emptySet(setNumber, previous) {
  return {
    id: createId('set'),
    setNumber,
    reps: previous?.reps ?? '',
    weightKg: previous?.weightKg ?? '',
    rpe: previous?.rpe ?? '',
    rir: previous?.rir ?? '',
    completed: false,
    completedAt: null,
  }
}

function buildSession(state, day) {
  return {
    id: createId('session'),
    dayId: day.id,
    startedAt: new Date().toISOString(),
    completedAt: null,
    entries: [...day.exercises]
      .sort((a, b) => a.order - b.order)
      .map((item) => {
        const previous = lastCompletedSets(state, item.exerciseId)
        const sets = Array.from({ length: item.sets }, (_, index) => {
          const prev = previous.find((set) => set.setNumber === index + 1) || previous[index]
          return emptySet(index + 1, prev)
        })
        return {
          routineExerciseId: item.id,
          exerciseId: item.exerciseId,
          sets,
        }
      }),
  }
}

function startedOnLocalDay(iso, dayStr) {
  return todayISO(new Date(iso)) === dayStr
}

export function findOpenSessionToday(state, dayId) {
  const today = todayISO()
  return (
    state.sessions.find(
      (session) =>
        session.dayId === dayId &&
        !session.completedAt &&
        startedOnLocalDay(session.startedAt, today),
    ) || null
  )
}

export function ensureTodaySession(dayId) {
  return update((state) => {
    const day = sortedDays(state).find((item) => item.id === dayId)
    if (!day) return state
    if (findOpenSessionToday(state, dayId)) return state
    return {
      ...state,
      sessions: [...state.sessions, buildSession(state, day)],
    }
  })
}

export function updateSet(sessionId, routineExerciseId, setId, patch) {
  return update((state) => ({
    ...state,
    sessions: state.sessions.map((session) => {
      if (session.id !== sessionId) return session
      return {
        ...session,
        entries: session.entries.map((entry) => {
          if (entry.routineExerciseId !== routineExerciseId) return entry
          return {
            ...entry,
            sets: entry.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
          }
        }),
      }
    }),
  }))
}

export function completeSession(sessionId) {
  return update(
    (state) => ({
      ...state,
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, completedAt: new Date().toISOString() } : session,
      ),
    }),
    { immediate: true },
  )
}

export function upsertBodyLog(date, weightKg) {
  return update((state) => {
    const existing = state.bodyLogs.find((log) => log.date === date)
    if (existing) {
      return {
        ...state,
        bodyLogs: state.bodyLogs.map((log) => (log.date === date ? { ...log, weightKg } : log)),
      }
    }
    return {
      ...state,
      bodyLogs: [...state.bodyLogs, { id: createId('log'), date, weightKg }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    }
  })
}

export function previousSessions(state, sessionId) {
  const currentSession = state.sessions.find((session) => session.id === sessionId)
  if (!currentSession) return state.sessions
  return state.sessions.filter((session) => session.id !== sessionId)
}

export function hasOpenSession(state, dayId) {
  return (state.sessions || []).some((session) => session.dayId === dayId && session.completedAt == null)
}

export function resetStore(state = null) {
  disablePersist()
  current = state
}

export function addDay({ name } = {}) {
  return update((state) => {
    const days = state.routine?.days || []
    const maxOrder = days.reduce((max, day) => Math.max(max, Number(day.order) || 0), 0)
    const nextName = (name && String(name).trim()) || `Día ${days.length + 1}`
    return {
      ...state,
      routine: {
        ...state.routine,
        days: [
          ...days,
          {
            id: createId('day'),
            name: nextName,
            order: maxOrder + 1,
            exercises: [],
          },
        ],
      },
    }
  })
}

export function renameDay(dayId, name) {
  const nextName = String(name || '').trim()
  return update((state) => ({
    ...state,
    routine: {
      ...state.routine,
      days: (state.routine?.days || []).map((day) =>
        day.id === dayId ? { ...day, name: nextName || day.name } : day,
      ),
    },
  }))
}

export function deleteDay(dayId) {
  return update((state) => ({
    ...state,
    routine: {
      ...state.routine,
      days: (state.routine?.days || []).filter((day) => day.id !== dayId),
    },
  }))
}

export function reorderDays(orderedIds = []) {
  return update((state) => {
    const days = state.routine?.days || []
    const byId = Object.fromEntries(days.map((day) => [day.id, day]))
    const seen = new Set()
    const next = []
    for (const id of orderedIds) {
      const day = byId[id]
      if (!day || seen.has(id)) continue
      seen.add(id)
      next.push({ ...day, order: next.length + 1 })
    }
    for (const day of days) {
      if (seen.has(day.id)) continue
      next.push({ ...day, order: next.length + 1 })
    }
    return {
      ...state,
      routine: { ...state.routine, days: next },
    }
  })
}

export function addExerciseToDay(dayId, payload = {}) {
  return update((state) => ({
    ...state,
    routine: {
      ...state.routine,
      days: (state.routine?.days || []).map((day) => {
        if (day.id !== dayId) return day
        const maxOrder = (day.exercises || []).reduce(
          (max, item) => Math.max(max, Number(item.order) || 0),
          0,
        )
        return {
          ...day,
          exercises: [
            ...(day.exercises || []),
            {
              id: createId('re'),
              exerciseId: payload.exerciseId,
              sets: Number(payload.sets) > 0 ? Number(payload.sets) : 3,
              repMin: Number(payload.repMin) > 0 ? Number(payload.repMin) : 8,
              repMax: Number(payload.repMax) > 0 ? Number(payload.repMax) : 12,
              restSeconds: Number(payload.restSeconds) > 0 ? Number(payload.restSeconds) : 90,
              notes: payload.notes ?? '',
              order: maxOrder + 1,
            },
          ],
        }
      }),
    },
  }))
}

export function updateRoutineExercise(dayId, routineExerciseId, patch = {}) {
  const safePatch = { ...patch }
  delete safePatch.id
  return update((state) => ({
    ...state,
    routine: {
      ...state.routine,
      days: (state.routine?.days || []).map((day) => {
        if (day.id !== dayId) return day
        return {
          ...day,
          exercises: (day.exercises || []).map((item) =>
            item.id === routineExerciseId ? { ...item, ...safePatch } : item,
          ),
        }
      }),
    },
  }))
}

export function removeExerciseFromDay(dayId, routineExerciseId) {
  return update((state) => ({
    ...state,
    routine: {
      ...state.routine,
      days: (state.routine?.days || []).map((day) => {
        if (day.id !== dayId) return day
        return {
          ...day,
          exercises: (day.exercises || []).filter((item) => item.id !== routineExerciseId),
        }
      }),
    },
  }))
}

export function reorderExercisesInDay(dayId, orderedIds = []) {
  return update((state) => ({
    ...state,
    routine: {
      ...state.routine,
      days: (state.routine?.days || []).map((day) => {
        if (day.id !== dayId) return day
        const items = day.exercises || []
        const byId = Object.fromEntries(items.map((item) => [item.id, item]))
        const seen = new Set()
        const next = []
        for (const id of orderedIds) {
          const item = byId[id]
          if (!item || seen.has(id)) continue
          seen.add(id)
          next.push({ ...item, order: next.length + 1 })
        }
        for (const item of items) {
          if (seen.has(item.id)) continue
          next.push({ ...item, order: next.length + 1 })
        }
        return { ...day, exercises: next }
      }),
    },
  }))
}

export function addCustomExercise({ name, muscleGroup, equipment } = {}) {
  return update((state) => ({
    ...state,
    exercises: [
      ...(state.exercises || []),
      normalizeExercise({
        id: createId('ex'),
        name: String(name || '').trim() || 'Ejercicio personalizado',
        muscleGroup: muscleGroup || 'core',
        equipment: String(equipment || '').trim() || 'otro',
        isCustom: true,
        source: 'custom',
      }),
    ],
  }))
}

export function ensureExercise(exercise) {
  if (!exercise?.id) return getState()
  return update((state) => {
    if ((state.exercises || []).some((item) => item.id === exercise.id)) return state
    return {
      ...state,
      exercises: [...(state.exercises || []), normalizeExercise(exercise)],
    }
  })
}
