export function asStringList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (value == null || value === '') return []
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function normalizeExercise(exercise = {}) {
  return {
    id: exercise.id,
    name: exercise.name ?? '',
    muscleGroup: exercise.muscleGroup || exercise.muscle_group || 'core',
    isCustom: Boolean(exercise.isCustom ?? exercise.is_custom),
    equipment: exercise.equipment ?? '',
    externalId: exercise.externalId ?? exercise.external_id ?? null,
    source: exercise.source ?? null,
    bodyPart: exercise.bodyPart ?? exercise.body_part ?? null,
    target: exercise.target ?? null,
    imageUrl: exercise.imageUrl ?? exercise.image_url ?? null,
    gifUrl: exercise.gifUrl ?? exercise.gif_url ?? null,
    instructionsEs: exercise.instructionsEs ?? exercise.instructions_es ?? null,
    instructionsEn: exercise.instructionsEn ?? exercise.instructions_en ?? null,
    secondaryMuscles: asStringList(exercise.secondaryMuscles ?? exercise.secondary_muscles),
  }
}

export function exerciseToRow(exercise = {}) {
  const normalized = normalizeExercise(exercise)
  return {
    id: normalized.id,
    name: normalized.name,
    muscle_group: normalized.muscleGroup,
    is_custom: Boolean(normalized.isCustom),
    equipment: normalized.equipment ?? '',
    external_id: normalized.externalId ?? null,
    source: normalized.source ?? null,
    body_part: normalized.bodyPart ?? null,
    target: normalized.target ?? null,
    image_url: normalized.imageUrl ?? null,
    gif_url: normalized.gifUrl ?? null,
    instructions_es: normalized.instructionsEs ?? null,
    instructions_en: normalized.instructionsEn ?? null,
    secondary_muscles: normalized.secondaryMuscles.length ? normalized.secondaryMuscles.join(',') : null,
  }
}

export function exerciseFromRow(row = {}) {
  return normalizeExercise(row)
}

export function isCatalogSource(source) {
  return String(source || '') === 'dataset'
}
