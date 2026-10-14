import { describe, expect, it } from 'vitest'
import { kgToLbs, lbsToKg, KG_TO_LBS } from './units.js'

describe('units', () => {
  it('usa 1 kg = 2.20462 lbs', () => {
    expect(kgToLbs(1)).toBe(KG_TO_LBS)
    expect(kgToLbs(1)).toBe(2.20462)
  })

  it('roundtrip kg ↔ lbs', () => {
    const samples = [0, 1, 70, 82.5, 100]
    for (const kg of samples) {
      expect(lbsToKg(kgToLbs(kg))).toBeCloseTo(kg, 10)
    }
  })
})
