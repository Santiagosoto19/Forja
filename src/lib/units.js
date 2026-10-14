export const KG_TO_LBS = 2.20462

export function kgToLbs(kg) {
  return Number(kg) * KG_TO_LBS
}

export function lbsToKg(lbs) {
  return Number(lbs) / KG_TO_LBS
}

export function toDisplayWeight(weightKg, unit) {
  const value = unit === 'lbs' ? kgToLbs(weightKg) : Number(weightKg)
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 10) / 10
}

export function fromDisplayWeight(value, unit) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return unit === 'lbs' ? lbsToKg(n) : n
}

export function unitLabel(unit) {
  return unit === 'lbs' ? 'lbs' : 'kg'
}

export function formatWeight(weightKg, unit, digits = 1) {
  const value = toDisplayWeight(weightKg, unit)
  return `${value.toFixed(digits)} ${unitLabel(unit)}`
}
