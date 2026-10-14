export const EXERCISE_EXTRA_COLUMNS = [
  { name: 'external_id', type: 'TEXT' },
  { name: 'source', type: 'TEXT' },
  { name: 'body_part', type: 'TEXT' },
  { name: 'target', type: 'TEXT' },
  { name: 'image_url', type: 'TEXT' },
  { name: 'gif_url', type: 'TEXT' },
  { name: 'instructions_es', type: 'TEXT' },
  { name: 'instructions_en', type: 'TEXT' },
  { name: 'secondary_muscles', type: 'TEXT' },
]

export const EXERCISE_COLUMN_NAMES = [
  'id',
  'name',
  'muscle_group',
  'is_custom',
  'equipment',
  'external_id',
  'source',
  'body_part',
  'target',
  'image_url',
  'gif_url',
  'instructions_es',
  'instructions_en',
  'secondary_muscles',
]

export function sqliteEnsureExerciseColumns(db) {
  for (const col of EXERCISE_EXTRA_COLUMNS) {
    try {
      db.exec(`ALTER TABLE exercises ADD COLUMN ${col.name} ${col.type}`)
    } catch {
      // columna ya existe
    }
  }
}

export function postgresEnsureExerciseSql() {
  return EXERCISE_EXTRA_COLUMNS.map(
    (col) => `ALTER TABLE exercises ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`,
  )
}

export function exerciseRowValues(row, sqliteBool = false) {
  const custom = Boolean(row.is_custom)
  return [
    row.id,
    row.name,
    row.muscle_group,
    sqliteBool ? (custom ? 1 : 0) : custom,
    row.equipment ?? '',
    row.external_id ?? null,
    row.source ?? null,
    row.body_part ?? null,
    row.target ?? null,
    row.image_url ?? null,
    row.gif_url ?? null,
    row.instructions_es ?? null,
    row.instructions_en ?? null,
    row.secondary_muscles ?? null,
  ]
}

export const EXERCISE_UPSERT_SQL = `INSERT INTO exercises (
  id, name, muscle_group, is_custom, equipment,
  external_id, source, body_part, target, image_url, gif_url,
  instructions_es, instructions_en, secondary_muscles
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  muscle_group = excluded.muscle_group,
  is_custom = excluded.is_custom,
  equipment = excluded.equipment,
  external_id = COALESCE(excluded.external_id, exercises.external_id),
  source = COALESCE(excluded.source, exercises.source),
  body_part = COALESCE(excluded.body_part, exercises.body_part),
  target = COALESCE(excluded.target, exercises.target),
  image_url = COALESCE(excluded.image_url, exercises.image_url),
  gif_url = COALESCE(excluded.gif_url, exercises.gif_url),
  instructions_es = COALESCE(excluded.instructions_es, exercises.instructions_es),
  instructions_en = COALESCE(excluded.instructions_en, exercises.instructions_en),
  secondary_muscles = COALESCE(excluded.secondary_muscles, exercises.secondary_muscles)`
