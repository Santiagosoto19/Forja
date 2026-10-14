import { describe, expect, it } from 'vitest'
import {
  bmi,
  bmiCategory,
  bmrMifflin,
  detectPrs,
  epley1RM,
  estimated1RM,
  estimatedSessionKcal,
  estimatedSessionMinutes,
  sessionExerciseVolume,
  setVolume,
} from './formulas.js'

describe('bmi', () => {
  it('calcula IMC conocidos', () => {
    expect(bmi(70, 170)).toBeCloseTo(24.22, 2)
    expect(bmi(80, 180)).toBeCloseTo(24.69, 2)
    expect(bmi(50, 170)).toBeCloseTo(17.3, 1)
  })

  it('categoriza en español', () => {
    expect(bmiCategory(17)).toBe('Bajo peso')
    expect(bmiCategory(22)).toBe('Normal')
    expect(bmiCategory(27)).toBe('Sobrepeso')
    expect(bmiCategory(32)).toBe('Obesidad')
  })
})

describe('bmrMifflin', () => {
  it('usa el ejemplo clásico hombre 80 kg / 180 cm / 30 años', () => {
    expect(bmrMifflin({ weightKg: 80, heightCm: 180, age: 30, gender: 'male' })).toBe(1780)
  })
})

describe('1RM', () => {
  it('Epley 100 kg × 5 ≈ 116.7', () => {
    expect(epley1RM(100, 5)).toBeCloseTo(116.7, 1)
  })

  it('estimated1RM con 1 rep devuelve el peso', () => {
    expect(estimated1RM(100, 1)).toBe(100)
  })
})

describe('volumen', () => {
  it('setVolume y sessionExerciseVolume solo cuentan series completadas', () => {
    expect(setVolume(80, 10)).toBe(800)
    expect(
      sessionExerciseVolume([
        { completed: true, weightKg: 80, reps: 10 },
        { completed: false, weightKg: 90, reps: 8 },
      ]),
    ).toBe(800)
  })
})

describe('detectPrs', () => {
  const previousSessions = [
    {
      entries: [
        {
          exerciseId: 'ex_press_banca',
          sets: [{ completed: true, weightKg: 80, reps: 5 }],
        },
      ],
    },
  ]

  it('detecta PR de peso, volumen y 1RM', () => {
    const prs = detectPrs({
      exerciseId: 'ex_press_banca',
      currentSet: { completed: true, weightKg: 90, reps: 5 },
      currentSessionVolume: 90 * 5,
      previousSessions,
    })
    expect(prs.isWeightPr).toBe(true)
    expect(prs.isVolumePr).toBe(true)
    expect(prs.isOneRmPr).toBe(true)
  })

  it('no marca PR si el rendimiento es menor', () => {
    const prs = detectPrs({
      exerciseId: 'ex_press_banca',
      currentSet: { completed: true, weightKg: 70, reps: 5 },
      currentSessionVolume: 70 * 5,
      previousSessions,
    })
    expect(prs.isWeightPr).toBe(false)
    expect(prs.isVolumePr).toBe(false)
    expect(prs.isOneRmPr).toBe(false)
  })

  it('no marca PRs falsos intra-sesión', () => {
    const set1 = { id: 'set1', completed: true, weightKg: 90, reps: 5 }
    const set2 = { id: 'set2', completed: true, weightKg: 90, reps: 5 }

    const prsSet1 = detectPrs({
      exerciseId: 'ex_press_banca',
      currentSet: set1,
      currentSessionVolume: 90 * 5,
      previousSessions,
      currentSessionOtherSets: [],
    })
    expect(prsSet1.isWeightPr).toBe(true)
    expect(prsSet1.isVolumePr).toBe(true)

    const prsSet2 = detectPrs({
      exerciseId: 'ex_press_banca',
      currentSet: set2,
      currentSessionVolume: 90 * 5 + 90 * 5,
      previousSessions,
      currentSessionOtherSets: [set1],
    })
    expect(prsSet2.isWeightPr).toBe(false)
    expect(prsSet2.isOneRmPr).toBe(false)
    expect(prsSet2.isVolumePr).toBe(false)

    const prs85 = detectPrs({
      exerciseId: 'ex_press_banca',
      currentSet: { id: 'set3', completed: true, weightKg: 85, reps: 5 },
      currentSessionVolume: 90 * 5 + 85 * 5,
      previousSessions,
      currentSessionOtherSets: [set1],
    })
    expect(prs85.isWeightPr).toBe(false)
  })
})

describe('kcal de sesión', () => {
  const session = {
    entries: [
      {
        sets: [
          { completed: true, weightKg: 80, reps: 10 },
          { completed: true, weightKg: 80, reps: 10 },
          { completed: false, weightKg: 80, reps: 10 },
        ],
      },
    ],
  }

  it('estima minutos = sets*rest/60 + sets*0.75', () => {
    expect(estimatedSessionMinutes(session, 90)).toBeCloseTo(2 * 1.5 + 2 * 0.75, 5)
  })

  it('kcal = MET 6 * kg * horas', () => {
    const minutes = 2 * 1.5 + 2 * 0.75
    expect(estimatedSessionKcal(session, { weightKg: 80 }, 90)).toBe(
      Math.round(6 * 80 * (minutes / 60)),
    )
  })

  it('sin series completadas o sin peso devuelve 0', () => {
    expect(estimatedSessionKcal({ entries: [] }, { weightKg: 80 })).toBe(0)
    expect(estimatedSessionKcal(session, { weightKg: 0 })).toBe(0)
  })
})
