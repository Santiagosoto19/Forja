import { createId } from '../src/lib/ids.js'
import { exerciseFromRow, exerciseToRow } from '../src/lib/exerciseFields.js'

export const SCHEMA_VERSION = 1

function numOrNull(value) {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function numOrEmpty(value) {
  if (value == null || value === '') return ''
  const n = Number(value)
  return Number.isFinite(n) ? n : ''
}

function numOrUndefinedNull(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function dateOnly(value) {
  if (!value) return null
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

function iso(value) {
  if (!value) return null
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function bool(value) {
  return value === true || value === 1 || value === '1' || value === 't' || value === 'true'
}

export function stateToRows(state) {
  const user = state.user || {}
  const users = [
    {
      id: user.id,
      name: user.name ?? '',
      age: numOrUndefinedNull(user.age),
      gender: user.gender ?? 'male',
      height_cm: numOrUndefinedNull(user.heightCm),
      experience_level: user.experienceLevel ?? 'beginner',
      goal: user.goal ?? 'hypertrophy',
      weight_unit: user.weightUnit ?? 'kg',
      onboarding_complete: Boolean(user.onboardingComplete),
    },
  ]

  const bodyLogs = (state.bodyLogs || []).map((log) => ({
    id: log.id,
    date: dateOnly(log.date),
    weight_kg: numOrNull(log.weightKg),
  }))

  const exercises = (state.exercises || []).map((exercise) => exerciseToRow(exercise))

  const routine = state.routine || { id: 'routine_empty', name: '', days: [] }
  const routines = [{ id: routine.id, name: routine.name ?? '' }]

  const routineDays = []
  const routineExercises = []
  for (const day of routine.days || []) {
    routineDays.push({
      id: day.id,
      routine_id: routine.id,
      name: day.name,
      sort_order: Number(day.order) || 0,
    })
    for (const item of day.exercises || []) {
      routineExercises.push({
        id: item.id,
        day_id: day.id,
        exercise_id: item.exerciseId,
        sets: numOrNull(item.sets),
        rep_min: numOrNull(item.repMin),
        rep_max: numOrNull(item.repMax),
        rest_seconds: numOrNull(item.restSeconds),
        notes: item.notes ?? '',
        sort_order: Number(item.order) || 0,
      })
    }
  }

  const sessions = []
  const sessionEntries = []
  const sessionSets = []
  for (const session of state.sessions || []) {
    sessions.push({
      id: session.id,
      day_id: session.dayId ?? null,
      started_at: iso(session.startedAt),
      completed_at: iso(session.completedAt),
    })
    for (const entry of session.entries || []) {
      const entryId = entry.id || createId('entry')
      sessionEntries.push({
        id: entryId,
        session_id: session.id,
        routine_exercise_id: entry.routineExerciseId ?? null,
        exercise_id: entry.exerciseId ?? null,
      })
      for (const set of entry.sets || []) {
        sessionSets.push({
          id: set.id,
          entry_id: entryId,
          set_number: Number(set.setNumber) || 0,
          reps: numOrNull(set.reps),
          weight_kg: numOrNull(set.weightKg),
          rpe: numOrNull(set.rpe),
          rir: numOrNull(set.rir),
          completed: Boolean(set.completed),
          completed_at: iso(set.completedAt),
        })
      }
    }
  }

  return {
    users,
    bodyLogs,
    exercises,
    routines,
    routineDays,
    routineExercises,
    sessions,
    sessionEntries,
    sessionSets,
  }
}

export function rowsToState(rows = {}) {
  const {
    users = [],
    bodyLogs = [],
    exercises = [],
    routines = [],
    routineDays = [],
    routineExercises = [],
    sessions = [],
    sessionEntries = [],
    sessionSets = [],
  } = rows

  const userRow = users[0] || {}
  const user = {
    id: userRow.id,
    name: userRow.name ?? '',
    age: userRow.age == null ? null : Number(userRow.age),
    gender: userRow.gender ?? 'male',
    heightCm: userRow.height_cm == null ? null : Number(userRow.height_cm),
    experienceLevel: userRow.experience_level ?? 'beginner',
    goal: userRow.goal ?? 'hypertrophy',
    weightUnit: userRow.weight_unit ?? 'kg',
    onboardingComplete: bool(userRow.onboarding_complete),
  }

  const logs = [...bodyLogs]
    .map((log) => ({
      id: log.id,
      date: dateOnly(log.date),
      weightKg: log.weight_kg == null ? null : Number(log.weight_kg),
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))

  const exerciseList = exercises.map((exercise) => exerciseFromRow(exercise))

  const routineRow = routines[0] || { id: 'routine_empty', name: '' }
  const itemsByDay = new Map()
  for (const item of routineExercises) {
    const list = itemsByDay.get(item.day_id) || []
    list.push(item)
    itemsByDay.set(item.day_id, list)
  }

  const days = [...routineDays]
    .filter((day) => day.routine_id === routineRow.id)
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
    .map((day) => ({
      id: day.id,
      name: day.name,
      order: Number(day.sort_order) || 0,
      exercises: [...(itemsByDay.get(day.id) || [])]
        .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
        .map((item) => ({
          id: item.id,
          exerciseId: item.exercise_id,
          sets: item.sets == null ? 0 : Number(item.sets),
          repMin: item.rep_min == null ? 0 : Number(item.rep_min),
          repMax: item.rep_max == null ? 0 : Number(item.rep_max),
          restSeconds: item.rest_seconds == null ? 0 : Number(item.rest_seconds),
          notes: item.notes ?? '',
          order: Number(item.sort_order) || 0,
        })),
    }))

  const setsByEntry = new Map()
  for (const set of sessionSets) {
    const list = setsByEntry.get(set.entry_id) || []
    list.push(set)
    setsByEntry.set(set.entry_id, list)
  }

  const entriesBySession = new Map()
  for (const entry of sessionEntries) {
    const list = entriesBySession.get(entry.session_id) || []
    list.push(entry)
    entriesBySession.set(entry.session_id, list)
  }

  const sessionList = [...sessions]
    .sort((a, b) => String(a.started_at).localeCompare(String(b.started_at)))
    .map((session) => ({
      id: session.id,
      dayId: session.day_id,
      startedAt: iso(session.started_at),
      completedAt: iso(session.completed_at),
      entries: (entriesBySession.get(session.id) || []).map((entry) => ({
        id: entry.id,
        routineExerciseId: entry.routine_exercise_id,
        exerciseId: entry.exercise_id,
        sets: [...(setsByEntry.get(entry.id) || [])]
          .sort((a, b) => (Number(a.set_number) || 0) - (Number(b.set_number) || 0))
          .map((set) => ({
            id: set.id,
            setNumber: Number(set.set_number) || 0,
            reps: numOrEmpty(set.reps),
            weightKg: numOrEmpty(set.weight_kg),
            rpe: numOrEmpty(set.rpe),
            rir: numOrEmpty(set.rir),
            completed: bool(set.completed),
            completedAt: iso(set.completed_at),
          })),
      })),
    }))

  return {
    schemaVersion: SCHEMA_VERSION,
    user,
    bodyLogs: logs,
    exercises: exerciseList,
    routine: {
      id: routineRow.id,
      name: routineRow.name ?? '',
      days,
    },
    sessions: sessionList,
  }
}
