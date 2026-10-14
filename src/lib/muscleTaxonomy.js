export const DATASET_RAW_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'

const BODY_PART_MAP = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  waist: 'core',
  cardio: 'core',
  neck: 'shoulders',
  'upper arms': 'arms',
  'lower arms': 'arms',
  'upper legs': 'legs',
  'lower legs': 'legs',
}

const TARGET_MAP = {
  abs: 'core',
  obliques: 'core',
  spine: 'core',
  cardiovascular: 'core',
  biceps: 'arms',
  triceps: 'arms',
  forearms: 'arms',
  delts: 'shoulders',
  deltoid: 'shoulders',
  pectorals: 'chest',
  'pectoralis major': 'chest',
  lats: 'back',
  traps: 'back',
  'upper back': 'back',
  'lower back': 'back',
  quadriceps: 'legs',
  hamstrings: 'legs',
  glutes: 'legs',
  calves: 'legs',
  adductors: 'legs',
  abductors: 'legs',
  quads: 'legs',
}

export function datasetMediaUrl(path) {
  if (path == null || path === '') return null
  const value = String(path).trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  return `${DATASET_RAW_BASE}${value.replace(/^\.\//, '')}`
}

export function mapDatasetMuscle(bodyPart, target) {
  const bp = String(bodyPart || '').trim().toLowerCase()
  const tg = String(target || '').trim().toLowerCase()

  if (BODY_PART_MAP[bp]) return BODY_PART_MAP[bp]
  if (TARGET_MAP[tg]) return TARGET_MAP[tg]

  if (bp.includes('chest') || tg.includes('pector')) return 'chest'
  if (bp.includes('back') || tg.includes('latissimus') || tg.includes('trap')) return 'back'
  if (
    bp.includes('leg') ||
    tg.includes('quad') ||
    tg.includes('glut') ||
    tg.includes('hamstring') ||
    tg.includes('calf') ||
    tg.includes('adductor')
  ) {
    return 'legs'
  }
  if (bp.includes('shoulder') || tg.includes('delt')) return 'shoulders'
  if (bp.includes('arm') || tg.includes('bicep') || tg.includes('tricep') || tg.includes('forearm')) {
    return 'arms'
  }
  return 'core'
}

export function toCatalogExercise(record = {}) {
  const externalId = String(record.id ?? '')
  const bodyPart = record.body_part || record.category || ''
  const target = record.target || ''
  const secondary = Array.isArray(record.secondary_muscles)
    ? record.secondary_muscles
    : record.secondary_muscles
      ? [record.secondary_muscles]
      : []

  return {
    id: `ext_${externalId}`,
    name: record.name || 'Ejercicio',
    muscleGroup: mapDatasetMuscle(bodyPart, target),
    isCustom: false,
    equipment: record.equipment || '',
    externalId,
    source: 'dataset',
    bodyPart,
    target,
    imageUrl: datasetMediaUrl(record.image || record.image_url),
    gifUrl: datasetMediaUrl(record.gif_url),
    instructionsEs: record.instructions?.es || null,
    instructionsEn: record.instructions?.en || null,
    secondaryMuscles: secondary.map((item) => String(item)),
  }
}
