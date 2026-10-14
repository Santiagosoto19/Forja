import { describe, expect, it } from 'vitest'
import {
  activeStreak,
  badgeStates,
  completedWorkouts,
  earnedBadgeIds,
  levelProgress,
  userLevel,
  weekCalories,
  muscleVolume,
  volumeByMonth,
  volumeByWeek,
  weightSeries,
} from './analytics.js'

const sessions = [
  {
    startedAt: '2026-09-22T12:00:00.000Z',
    completedAt: '2026-09-22T13:00:00.000Z',
    entries: [
      {
        exerciseId: 'ex_press_banca',
        sets: [
          { completed: true, weightKg: 80, reps: 10 },
          { completed: false, weightKg: 100, reps: 10 },
        ],
      },
      {
        exerciseId: 'ex_sentadilla',
        sets: [{ completed: true, weightKg: 100, reps: 5 }],
      },
    ],
  },
  {
    startedAt: '2026-09-23T12:00:00.000Z',
    completedAt: null,
    entries: [
      {
        exerciseId: 'ex_dominadas',
        sets: [{ completed: true, weightKg: 20, reps: 8 }],
      },
    ],
  },
]

const exercises = [
  { id: 'ex_press_banca', muscleGroup: 'chest' },
  { id: 'ex_sentadilla', muscleGroup: 'legs' },
  { id: 'ex_dominadas', muscleGroup: 'back' },
]

describe('analytics', () => {
  it('volumeByWeek suma weightKg * reps solo de series completadas', () => {
    const rows = volumeByWeek(sessions)
    const total = rows.reduce((sum, row) => sum + row.volume, 0)
    expect(total).toBe(800 + 500 + 160)
    expect(rows.every((row) => typeof row.week === 'string' && row.week.length === 10)).toBe(true)
  })

  it('volumeByMonth agrupa por YYYY-MM', () => {
    const rows = volumeByMonth(sessions)
    expect(rows).toHaveLength(1)
    expect(rows[0].month).toBe('2026-09')
    expect(rows[0].volume).toBe(1460)
  })

  it('weightSeries ordena logs por fecha', () => {
    expect(
      weightSeries([
        { date: '2026-09-20', weightKg: 81 },
        { date: '2026-09-10', weightKg: 80 },
      ]),
    ).toEqual([
      { date: '2026-09-10', weightKg: 80 },
      { date: '2026-09-20', weightKg: 81 },
    ])
  })

  it('muscleVolume agrupa por grupo muscular', () => {
    const rows = muscleVolume(sessions, exercises)
    const byGroup = Object.fromEntries(rows.map((row) => [row.muscleGroup, row.volume]))
    expect(byGroup.chest).toBe(800)
    expect(byGroup.legs).toBe(500)
    expect(byGroup.back).toBe(160)
  })
})

describe('métricas de racha y nivel', () => {
  it('completedWorkouts cuenta solo sesiones con completedAt', () => {
    expect(completedWorkouts(sessions)).toBe(1)
    expect(completedWorkouts([])).toBe(0)
  })

  it('userLevel sube 1 cada 5 entrenos', () => {
    expect(userLevel(0)).toBe(1)
    expect(userLevel(4)).toBe(1)
    expect(userLevel(5)).toBe(2)
    expect(levelProgress(7)).toEqual({ level: 2, current: 2, nextAt: 5, pct: 40 })
  })

  it('activeStreak cuenta días locales consecutivos con completedAt', () => {
    const today = new Date(2026, 8, 27, 18, 0, 0)
    const rows = [
      { completedAt: new Date(2026, 8, 27, 8, 0, 0).toISOString() },
      { completedAt: new Date(2026, 8, 26, 21, 0, 0).toISOString() },
      { completedAt: new Date(2026, 8, 25, 7, 0, 0).toISOString() },
    ]
    expect(activeStreak(rows, today)).toBe(3)
  })

  it('activeStreak sigue viva si el último entreno fue ayer', () => {
    const today = new Date(2026, 8, 27, 10, 0, 0)
    const rows = [{ completedAt: new Date(2026, 8, 26, 20, 0, 0).toISOString() }]
    expect(activeStreak(rows, today)).toBe(1)
  })

  it('activeStreak se rompe si falta un día', () => {
    const today = new Date(2026, 8, 27, 10, 0, 0)
    const rows = [{ completedAt: new Date(2026, 8, 25, 10, 0, 0).toISOString() }]
    expect(activeStreak(rows, today)).toBe(0)
  })
})

describe('insignias y kcal semanal', () => {
  it('otorga primera_sesion y racha_3', () => {
    const today = new Date(2026, 8, 27, 12, 0, 0)
    const rows = [0, 1, 2].map((offset) => ({
      completedAt: new Date(2026, 8, 27 - offset, 9, 0, 0).toISOString(),
      entries: [],
    }))
    const ids = earnedBadgeIds(rows, today)
    expect(ids).toContain('primera_sesion')
    expect(ids).toContain('racha_3')
    expect(ids).not.toContain('racha_7')
  })

  it('detecta pr_hunter y volumen_10k', () => {
    const rows = [
      {
        completedAt: '2026-09-20T12:00:00.000Z',
        entries: [
          {
            exerciseId: 'ex_press_banca',
            sets: [{ completed: true, weightKg: 80, reps: 10 }],
          },
        ],
      },
      {
        completedAt: '2026-09-22T12:00:00.000Z',
        entries: [
          {
            exerciseId: 'ex_press_banca',
            sets: [{ completed: true, weightKg: 100, reps: 100 }],
          },
        ],
      },
    ]
    const ids = earnedBadgeIds(rows, new Date('2026-09-22T20:00:00.000Z'))
    expect(ids).toContain('pr_hunter')
    expect(ids).toContain('volumen_10k')
  })

  it('weekCalories suma heurística de sesiones completadas recientes', () => {
    const from = new Date('2026-09-24T12:00:00.000Z')
    const kcal = weekCalories(
      [
        {
          completedAt: '2026-09-22T12:00:00.000Z',
          entries: [{ sets: [{ completed: true }, { completed: true }] }],
        },
        {
          completedAt: null,
          entries: [{ sets: [{ completed: true }, { completed: true }] }],
        },
      ],
      { weightKg: 80 },
      from,
    )
    const minutes = 2 * 1.5 + 2 * 0.75
    expect(kcal).toBe(Math.round(6 * 80 * (minutes / 60)))
  })

  it('badgeStates marca ganadas y bloqueadas', () => {
    const states = badgeStates([], new Date())
    expect(states).toHaveLength(5)
    expect(states.every((badge) => badge.earned === false)).toBe(true)
  })
})
