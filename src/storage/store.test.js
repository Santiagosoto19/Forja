import { beforeEach, describe, expect, it } from 'vitest'
import {
  addCustomExercise,
  addDay,
  addExerciseToDay,
  applyUpdate,
  createInitialState,
  deleteDay,
  getState,
  removeExerciseFromDay,
  renameDay,
  reorderDays,
  reorderExercisesInDay,
  resetStore,
  suggestedDayId,
} from './store.js'

describe('store', () => {
  it('estado inicial tiene exercises y routine', () => {
    const state = createInitialState()
    expect(state.schemaVersion).toBe(1)
    expect(state.exercises.length).toBeGreaterThanOrEqual(40)
    expect(state.routine.days.length).toBe(3)
    expect(state.user.onboardingComplete).toBe(false)
    expect(state.sessions).toEqual([])
    expect(state.bodyLogs).toEqual([])
  })

  it('update es inmutable-ish: no muta el estado original', () => {
    const state = createInitialState()
    const originalName = state.user.name
    const originalSessions = state.sessions
    const next = applyUpdate(state, (current) => ({
      ...current,
      user: { ...current.user, name: 'Ana' },
      sessions: [...current.sessions, { id: 'session_test' }],
    }))

    expect(state.user.name).toBe(originalName)
    expect(state.sessions).toBe(originalSessions)
    expect(state.sessions).toHaveLength(0)
    expect(next.user.name).toBe('Ana')
    expect(next.sessions).toHaveLength(1)
    expect(next).not.toBe(state)
  })

  it('suggestedDayId prioriza la sesión abierta frente a la última completada', () => {
    const state = createInitialState()
    const days = [...state.routine.days].sort((a, b) => a.order - b.order)
    const completedOnly = {
      ...state,
      sessions: [
        {
          id: 'session_done',
          dayId: days[0].id,
          startedAt: '2026-09-20T10:00:00.000Z',
          completedAt: '2026-09-20T11:00:00.000Z',
          entries: [],
        },
      ],
    }
    expect(suggestedDayId(completedOnly)).toBe(days[1].id)

    const withOpen = {
      ...state,
      sessions: [
        {
          id: 'session_done',
          dayId: days[0].id,
          startedAt: '2026-09-20T10:00:00.000Z',
          completedAt: '2026-09-20T11:00:00.000Z',
          entries: [],
        },
        {
          id: 'session_open',
          dayId: days[2].id,
          startedAt: '2026-09-24T10:00:00.000Z',
          completedAt: null,
          entries: [],
        },
      ],
    }
    expect(suggestedDayId(withOpen)).toBe(days[2].id)

    const twoOpen = {
      ...state,
      sessions: [
        {
          id: 'session_open_old',
          dayId: days[1].id,
          startedAt: '2026-09-24T09:00:00.000Z',
          completedAt: null,
          entries: [],
        },
        {
          id: 'session_open_new',
          dayId: days[2].id,
          startedAt: '2026-09-24T12:00:00.000Z',
          completedAt: null,
          entries: [],
        },
      ],
    }
    expect(suggestedDayId(twoOpen)).toBe(days[2].id)
  })

  it('suggestedDayId ignora sesión abierta de un día borrado y no devuelve el id fantasma', () => {
    const state = createInitialState()
    const days = [...state.routine.days].sort((a, b) => a.order - b.order)
    const ghostId = days[0].id
    const remaining = days.slice(1)
    const afterDelete = {
      ...state,
      routine: {
        ...state.routine,
        days: remaining,
      },
      sessions: [
        {
          id: 'session_open_ghost',
          dayId: ghostId,
          startedAt: '2026-09-24T12:00:00.000Z',
          completedAt: null,
          entries: [],
        },
        {
          id: 'session_done',
          dayId: remaining[0].id,
          startedAt: '2026-09-20T10:00:00.000Z',
          completedAt: '2026-09-20T11:00:00.000Z',
          entries: [],
        },
      ],
    }

    const suggested = suggestedDayId(afterDelete)
    expect(suggested).not.toBe(ghostId)
    expect(remaining.some((day) => day.id === suggested)).toBe(true)
    expect(suggested).toBe(remaining[1].id)
  })
})

describe('store CRUD', () => {
  beforeEach(() => {
    resetStore(createInitialState())
  })

  it('add/rename/delete/reorder días y no borra sessions', () => {
    const initial = getState()
    expect(initial.schemaVersion).toBe(1)
    const maxOrder = Math.max(...initial.routine.days.map((day) => day.order))
    const firstId = initial.routine.days[0].id
    resetStore({
      ...initial,
      sessions: [
        {
          id: 'session_keep',
          dayId: firstId,
          startedAt: '2026-09-24T10:00:00.000Z',
          completedAt: null,
          entries: [],
        },
      ],
    })

    addDay({ name: 'Core extra' })
    let state = getState()
    const added = state.routine.days.find((day) => day.name === 'Core extra')
    expect(added).toBeTruthy()
    expect(added.id.startsWith('day_')).toBe(true)
    expect(added.order).toBe(maxOrder + 1)
    expect(added.exercises).toEqual([])
    expect(state.schemaVersion).toBe(1)

    renameDay(added.id, 'Core')
    expect(getState().routine.days.find((day) => day.id === added.id).name).toBe('Core')

    const reversed = [...state.routine.days]
      .sort((a, b) => a.order - b.order)
      .map((day) => day.id)
      .reverse()
    reorderDays(reversed)
    const resorted = [...getState().routine.days].sort((a, b) => a.order - b.order)
    expect(resorted.map((day) => day.id)).toEqual(reversed)
    expect(resorted.map((day) => day.order)).toEqual(reversed.map((_, index) => index + 1))

    deleteDay(firstId)
    state = getState()
    expect(state.routine.days.find((day) => day.id === firstId)).toBeUndefined()
    expect(state.sessions).toHaveLength(1)
    expect(state.sessions[0].dayId).toBe(firstId)
    expect(state.schemaVersion).toBe(1)
  })

  it('add/remove/reorder ejercicios en un día', () => {
    const dayId = getState().routine.days[0].id
    const beforeCount = getState().routine.days[0].exercises.length

    addExerciseToDay(dayId, {
      exerciseId: 'ex_plancha',
      sets: 3,
      repMin: 8,
      repMax: 12,
      restSeconds: 60,
      notes: 'test',
    })
    let day = getState().routine.days.find((item) => item.id === dayId)
    expect(day.exercises).toHaveLength(beforeCount + 1)
    const added = day.exercises.find((item) => item.exerciseId === 'ex_plancha' && item.notes === 'test')
    expect(added.id.startsWith('re_')).toBe(true)
    expect(added.order).toBe(Math.max(...day.exercises.map((item) => item.order)))

    const ordered = [...day.exercises].sort((a, b) => a.order - b.order)
    const ids = [ordered[ordered.length - 1].id, ...ordered.slice(0, -1).map((item) => item.id)]
    reorderExercisesInDay(dayId, ids)
    day = getState().routine.days.find((item) => item.id === dayId)
    const resorted = [...day.exercises].sort((a, b) => a.order - b.order)
    expect(resorted.map((item) => item.id)).toEqual(ids)
    expect(resorted.map((item) => item.order)).toEqual(ids.map((_, index) => index + 1))

    removeExerciseFromDay(dayId, added.id)
    day = getState().routine.days.find((item) => item.id === dayId)
    expect(day.exercises.find((item) => item.id === added.id)).toBeUndefined()
    expect(getState().schemaVersion).toBe(1)
  })

  it('addCustomExercise marca isCustom y no cambia schemaVersion', () => {
    const before = getState().exercises.length
    addCustomExercise({ name: 'Face pull banda', muscleGroup: 'back', equipment: 'banda' })
    const state = getState()
    expect(state.exercises).toHaveLength(before + 1)
    const exercise = state.exercises.at(-1)
    expect(exercise.isCustom).toBe(true)
    expect(exercise.name).toBe('Face pull banda')
    expect(exercise.muscleGroup).toBe('back')
    expect(exercise.id.startsWith('ex_')).toBe(true)
    expect(state.schemaVersion).toBe(1)
  })
})
