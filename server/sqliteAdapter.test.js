import { describe, expect, it } from 'vitest'
import { createInitialState } from '../src/storage/store.js'
import { createSqliteAdapter } from './sqliteAdapter.js'

describe('sqliteAdapter', () => {
  it('siembra y hace roundtrip de estado con PUT equivalente', () => {
    const db = createSqliteAdapter(':memory:')
    try {
      expect(db.driver).toBe('sqlite')
      expect(db.ping()).toEqual({ ok: true })
      expect(db.hasUsers()).toBe(false)

      const seed = createInitialState()
      db.replaceState(seed)
      expect(db.hasUsers()).toBe(true)

      const loaded = db.readState()
      expect(loaded.user.id).toBe(seed.user.id)
      expect(loaded.user.onboardingComplete).toBe(false)
      expect(loaded.exercises).toEqual(seed.exercises)
      expect(loaded.routine).toEqual(seed.routine)

      const day = seed.routine.days[0]
      const item = day.exercises[0]
      const next = {
        ...loaded,
        user: { ...loaded.user, name: 'Ana', onboardingComplete: true },
        bodyLogs: [{ id: 'log_1', date: '2026-09-24', weightKg: 62.4 }],
        sessions: [
          {
            id: 'session_1',
            dayId: day.id,
            startedAt: '2026-09-24T10:00:00.000Z',
            completedAt: null,
            entries: [
              {
                id: 'entry_1',
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
                ],
              },
            ],
          },
        ],
      }

      db.replaceState(next)
      const saved = db.readState()
      expect(saved.user.name).toBe('Ana')
      expect(saved.user.onboardingComplete).toBe(true)
      expect(saved.bodyLogs[0].weightKg).toBe(62.4)
      expect(saved.sessions[0].dayId).toBe(day.id)
      expect(saved.sessions[0].entries[0].sets[0].completed).toBe(true)
      expect(saved.sessions[0].entries[0].sets[0].reps).toBe(8)
    } finally {
      db.close()
    }
  })

  it('el catálogo dataset no infla GET state y se consulta aparte', () => {
    const db = createSqliteAdapter(':memory:')
    try {
      const seed = createInitialState()
      db.replaceState(seed)
      db.upsertExercises([
        {
          id: 'ext_0001',
          name: 'Sit-up dataset',
          muscle_group: 'core',
          is_custom: 0,
          equipment: 'body weight',
          external_id: '0001',
          source: 'dataset',
          body_part: 'waist',
          target: 'abs',
          image_url: 'https://example.com/a.jpg',
          gif_url: null,
          instructions_es: 'Túmbate',
          instructions_en: 'Lie down',
          secondary_muscles: 'hip flexors',
        },
      ])

      const state = db.readState()
      expect(state.exercises.some((item) => item.id === 'ext_0001')).toBe(false)
      expect(state.exercises.length).toBe(seed.exercises.length)

      const found = db.listExercises({ q: 'sit-up', muscle: 'core', limit: 10 })
      expect(found.some((item) => item.id === 'ext_0001')).toBe(true)
      expect(found.find((item) => item.id === 'ext_0001').imageUrl).toBe('https://example.com/a.jpg')

      db.replaceState(seed)
      const afterPut = db.listExercises({ q: 'sit-up', muscle: 'core' })
      expect(afterPut.some((item) => item.id === 'ext_0001')).toBe(true)
      expect(db.readState().exercises.some((item) => item.id === 'ext_0001')).toBe(false)
    } finally {
      db.close()
    }
  })

  it('listExercises pagina con offset', () => {
    const db = createSqliteAdapter(':memory:')
    try {
      const seed = createInitialState()
      db.replaceState(seed)
      const first = db.listExercises({ limit: 5, offset: 0 })
      const second = db.listExercises({ limit: 5, offset: 5 })
      expect(first).toHaveLength(5)
      expect(second).toHaveLength(5)
      const firstIds = first.map((item) => item.id)
      const secondIds = second.map((item) => item.id)
      expect(firstIds.some((id) => secondIds.includes(id))).toBe(false)
      const window = db.listExercises({ limit: 10, offset: 0 })
      expect(window.slice(0, 5).map((item) => item.id)).toEqual(firstIds)
      expect(window.slice(5, 10).map((item) => item.id)).toEqual(secondIds)
    } finally {
      db.close()
    }
  })
})
