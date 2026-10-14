import { describe, expect, it } from 'vitest'
import { createInitialState } from '../src/storage/store.js'
import { rowsToState, stateToRows } from './stateMapper.js'

describe('stateMapper', () => {
  it('roundtrip del estado inicial conserva exercises, routine y user', () => {
    const state = createInitialState()
    const back = rowsToState(stateToRows(state))

    expect(back.schemaVersion).toBe(1)
    expect(back.user.onboardingComplete).toBe(false)
    expect(back.user.gender).toBe(state.user.gender)
    expect(back.exercises).toEqual(state.exercises)
    expect(back.routine).toEqual(state.routine)
    expect(back.bodyLogs).toEqual([])
    expect(back.sessions).toEqual([])
  })

  it('roundtrip de sesión anidada y campos vacíos', () => {
    const state = createInitialState()
    const day = state.routine.days[0]
    const item = day.exercises[0]
    const withSession = {
      ...state,
      user: {
        ...state.user,
        name: 'Ana',
        age: 29,
        heightCm: 168,
        onboardingComplete: true,
      },
      bodyLogs: [{ id: 'log_1', date: '2026-09-24', weightKg: 62.4 }],
      sessions: [
        {
          id: 'session_1',
          dayId: day.id,
          startedAt: '2026-09-24T10:00:00.000Z',
          completedAt: null,
          entries: [
            {
              routineExerciseId: item.id,
              exerciseId: item.exerciseId,
              sets: [
                {
                  id: 'set_1',
                  setNumber: 1,
                  reps: 8,
                  weightKg: 40,
                  rpe: 7,
                  rir: 2,
                  completed: true,
                  completedAt: '2026-09-24T10:05:00.000Z',
                },
                {
                  id: 'set_2',
                  setNumber: 2,
                  reps: '',
                  weightKg: '',
                  rpe: '',
                  rir: '',
                  completed: false,
                  completedAt: null,
                },
              ],
            },
          ],
        },
      ],
    }

    const rows = stateToRows(withSession)
    expect(rows.sessionEntries).toHaveLength(1)
    expect(rows.sessionEntries[0].id).toMatch(/^entry_/)
    expect(rows.sessionSets).toHaveLength(2)
    expect(rows.sessionSets[1].reps).toBeNull()

    const back = rowsToState(rows)
    expect(back.user.name).toBe('Ana')
    expect(back.user.heightCm).toBe(168)
    expect(back.bodyLogs[0].weightKg).toBe(62.4)
    expect(back.sessions[0].dayId).toBe(day.id)
    expect(back.sessions[0].completedAt).toBeNull()
    expect(back.sessions[0].entries[0].exerciseId).toBe(item.exerciseId)
    expect(back.sessions[0].entries[0].sets[0].reps).toBe(8)
    expect(back.sessions[0].entries[0].sets[0].completed).toBe(true)
    expect(back.sessions[0].entries[0].sets[1].reps).toBe('')
    expect(back.sessions[0].entries[0].sets[1].completed).toBe(false)
  })

  it('interpreta booleanos SQLite 0/1', () => {
    const on = rowsToState({
      users: [{ id: 'u1', onboarding_complete: 1 }],
      exercises: [{ id: 'e1', name: 'Press', muscle_group: 'chest', is_custom: 1, equipment: '' }],
      sessionSets: [{ id: 's1', entry_id: 'en1', set_number: 1, completed: 1 }],
      sessionEntries: [{ id: 'en1', session_id: 'se1' }],
      sessions: [{ id: 'se1', started_at: '2026-09-24T10:00:00.000Z' }],
    })
    expect(on.user.onboardingComplete).toBe(true)
    expect(on.exercises[0].isCustom).toBe(true)
    expect(on.exercises[0].source).toBeNull()
    expect(on.exercises[0].secondaryMuscles).toEqual([])
    expect(on.sessions[0].entries[0].sets[0].completed).toBe(true)

    const off = rowsToState({
      users: [{ id: 'u1', onboarding_complete: 0 }],
      exercises: [{ id: 'e1', name: 'Press', muscle_group: 'chest', is_custom: 0, equipment: '' }],
    })
    expect(off.user.onboardingComplete).toBe(false)
    expect(off.exercises[0].isCustom).toBe(false)
  })
})
