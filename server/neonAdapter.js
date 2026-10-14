import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'
import { exerciseFromRow, isCatalogSource } from '../src/lib/exerciseFields.js'
import { postgresEnsureExerciseSql } from './exerciseColumns.js'
import { rowsToState, stateToRows } from './stateMapper.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaSql = readFileSync(join(__dirname, 'schema.sql'), 'utf8')

function schemaStatements() {
  return schemaSql
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

function jsonParam(rows) {
  return JSON.stringify(rows || [])
}

function clampLimit(limit) {
  const n = Number(limit)
  if (!Number.isFinite(n)) return 40
  return Math.min(200, Math.max(1, Math.floor(n)))
}

function clampOffset(offset) {
  const n = Number(offset)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

function filterStateExercises(exercises, routineExercises, sessionEntries) {
  const used = new Set()
  for (const item of routineExercises || []) {
    if (item.exercise_id) used.add(item.exercise_id)
  }
  for (const item of sessionEntries || []) {
    if (item.exercise_id) used.add(item.exercise_id)
  }
  return (exercises || []).filter((row) => !isCatalogSource(row.source) || used.has(row.id))
}

function replaceQueries(client, rows) {
  return [
    client`DELETE FROM sessions`,
    client`DELETE FROM routines`,
    client`DELETE FROM exercises WHERE COALESCE(source, '') != 'dataset'`,
    client`DELETE FROM body_logs`,
    client`DELETE FROM users`,
    client`
      INSERT INTO users (id, name, age, gender, height_cm, experience_level, goal, weight_unit, onboarding_complete)
      SELECT id, name, age, gender, height_cm, experience_level, goal, weight_unit, onboarding_complete
      FROM json_to_recordset(${jsonParam(rows.users)}::json) AS x(
        id text, name text, age int, gender text, height_cm numeric,
        experience_level text, goal text, weight_unit text, onboarding_complete boolean
      )
    `,
    client`
      INSERT INTO body_logs (id, date, weight_kg)
      SELECT id, date, weight_kg
      FROM json_to_recordset(${jsonParam(rows.bodyLogs)}::json) AS x(
        id text, date date, weight_kg numeric
      )
    `,
    client`
      INSERT INTO exercises (
        id, name, muscle_group, is_custom, equipment,
        external_id, source, body_part, target, image_url, gif_url,
        instructions_es, instructions_en, secondary_muscles
      )
      SELECT id, name, muscle_group, is_custom, equipment,
        external_id, source, body_part, target, image_url, gif_url,
        instructions_es, instructions_en, secondary_muscles
      FROM json_to_recordset(${jsonParam(rows.exercises)}::json) AS x(
        id text, name text, muscle_group text, is_custom boolean, equipment text,
        external_id text, source text, body_part text, target text, image_url text,
        gif_url text, instructions_es text, instructions_en text, secondary_muscles text
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        muscle_group = EXCLUDED.muscle_group,
        is_custom = EXCLUDED.is_custom,
        equipment = EXCLUDED.equipment,
        external_id = COALESCE(EXCLUDED.external_id, exercises.external_id),
        source = COALESCE(EXCLUDED.source, exercises.source),
        body_part = COALESCE(EXCLUDED.body_part, exercises.body_part),
        target = COALESCE(EXCLUDED.target, exercises.target),
        image_url = COALESCE(EXCLUDED.image_url, exercises.image_url),
        gif_url = COALESCE(EXCLUDED.gif_url, exercises.gif_url),
        instructions_es = COALESCE(EXCLUDED.instructions_es, exercises.instructions_es),
        instructions_en = COALESCE(EXCLUDED.instructions_en, exercises.instructions_en),
        secondary_muscles = COALESCE(EXCLUDED.secondary_muscles, exercises.secondary_muscles)
    `,
    client`
      INSERT INTO routines (id, name)
      SELECT id, name
      FROM json_to_recordset(${jsonParam(rows.routines)}::json) AS x(
        id text, name text
      )
    `,
    client`
      INSERT INTO routine_days (id, routine_id, name, sort_order)
      SELECT id, routine_id, name, sort_order
      FROM json_to_recordset(${jsonParam(rows.routineDays)}::json) AS x(
        id text, routine_id text, name text, sort_order int
      )
    `,
    client`
      INSERT INTO routine_exercises (id, day_id, exercise_id, sets, rep_min, rep_max, rest_seconds, notes, sort_order)
      SELECT id, day_id, exercise_id, sets, rep_min, rep_max, rest_seconds, notes, sort_order
      FROM json_to_recordset(${jsonParam(rows.routineExercises)}::json) AS x(
        id text, day_id text, exercise_id text, sets int, rep_min int, rep_max int,
        rest_seconds int, notes text, sort_order int
      )
    `,
    client`
      INSERT INTO sessions (id, day_id, started_at, completed_at)
      SELECT id, day_id, started_at, completed_at
      FROM json_to_recordset(${jsonParam(rows.sessions)}::json) AS x(
        id text, day_id text, started_at timestamptz, completed_at timestamptz
      )
    `,
    client`
      INSERT INTO session_entries (id, session_id, routine_exercise_id, exercise_id)
      SELECT id, session_id, routine_exercise_id, exercise_id
      FROM json_to_recordset(${jsonParam(rows.sessionEntries)}::json) AS x(
        id text, session_id text, routine_exercise_id text, exercise_id text
      )
    `,
    client`
      INSERT INTO session_sets (id, entry_id, set_number, reps, weight_kg, rpe, rir, completed, completed_at)
      SELECT id, entry_id, set_number, reps, weight_kg, rpe, rir, completed, completed_at
      FROM json_to_recordset(${jsonParam(rows.sessionSets)}::json) AS x(
        id text, entry_id text, set_number int, reps numeric, weight_kg numeric,
        rpe numeric, rir numeric, completed boolean, completed_at timestamptz
      )
    `,
  ]
}

export function createNeonAdapter(databaseUrl) {
  let sql = null
  let schemaReady = false

  async function getClient() {
    if (!sql) sql = neon(databaseUrl)
    if (!schemaReady) {
      for (const statement of schemaStatements()) {
        await sql.query(statement)
      }
      for (const statement of postgresEnsureExerciseSql()) {
        await sql.query(statement)
      }
      schemaReady = true
    }
    return sql
  }

  async function ping() {
    try {
      const client = await getClient()
      await client`SELECT 1`
      return { ok: true }
    } catch (err) {
      schemaReady = false
      throw err
    }
  }

  async function hasUsers() {
    const client = await getClient()
    const users = await client`SELECT id FROM users LIMIT 1`
    return users.length > 0
  }

  async function readState() {
    const client = await getClient()
    const users = await client`SELECT * FROM users`
    const bodyLogs = await client`SELECT * FROM body_logs ORDER BY date`
    const exercises = await client`SELECT * FROM exercises`
    const routines = await client`SELECT * FROM routines`
    const routineDays = await client`SELECT * FROM routine_days ORDER BY sort_order`
    const routineExercises = await client`SELECT * FROM routine_exercises ORDER BY sort_order`
    const sessions = await client`SELECT * FROM sessions ORDER BY started_at`
    const sessionEntries = await client`SELECT * FROM session_entries`
    const sessionSets = await client`SELECT * FROM session_sets ORDER BY set_number`
    return rowsToState({
      users,
      bodyLogs,
      exercises: filterStateExercises(exercises, routineExercises, sessionEntries),
      routines,
      routineDays,
      routineExercises,
      sessions,
      sessionEntries,
      sessionSets,
    })
  }

  async function replaceState(state) {
    const client = await getClient()
    const rows = stateToRows(state)
    const queries = replaceQueries(client, rows)
    if (typeof client.transaction === 'function') {
      await client.transaction(queries)
    } else {
      for (const query of queries) await query
    }
  }

  async function upsertExercises(exercises = []) {
    if (!exercises.length) return 0
    const client = await getClient()
    await client`
      INSERT INTO exercises (
        id, name, muscle_group, is_custom, equipment,
        external_id, source, body_part, target, image_url, gif_url,
        instructions_es, instructions_en, secondary_muscles
      )
      SELECT id, name, muscle_group, is_custom, equipment,
        external_id, source, body_part, target, image_url, gif_url,
        instructions_es, instructions_en, secondary_muscles
      FROM json_to_recordset(${jsonParam(exercises)}::json) AS x(
        id text, name text, muscle_group text, is_custom boolean, equipment text,
        external_id text, source text, body_part text, target text, image_url text,
        gif_url text, instructions_es text, instructions_en text, secondary_muscles text
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        muscle_group = EXCLUDED.muscle_group,
        is_custom = EXCLUDED.is_custom,
        equipment = EXCLUDED.equipment,
        external_id = COALESCE(EXCLUDED.external_id, exercises.external_id),
        source = COALESCE(EXCLUDED.source, exercises.source),
        body_part = COALESCE(EXCLUDED.body_part, exercises.body_part),
        target = COALESCE(EXCLUDED.target, exercises.target),
        image_url = COALESCE(EXCLUDED.image_url, exercises.image_url),
        gif_url = COALESCE(EXCLUDED.gif_url, exercises.gif_url),
        instructions_es = COALESCE(EXCLUDED.instructions_es, exercises.instructions_es),
        instructions_en = COALESCE(EXCLUDED.instructions_en, exercises.instructions_en),
        secondary_muscles = COALESCE(EXCLUDED.secondary_muscles, exercises.secondary_muscles)
    `
    return exercises.length
  }

  async function listExercises({ q = '', muscle = '', limit = 40, offset = 0 } = {}) {
    const client = await getClient()
    const cap = clampLimit(limit)
    const skip = clampOffset(offset)
    const query = String(q || '').trim()
    const group = String(muscle || '').trim()
    const like = query ? `%${query}%` : null
    const muscleFilter = group && group !== 'all' ? group : null
    const rows = await client`
      SELECT * FROM exercises
      WHERE (${like}::text IS NULL OR name ILIKE ${like} OR COALESCE(target, '') ILIKE ${like})
        AND (${muscleFilter}::text IS NULL OR muscle_group = ${muscleFilter})
      ORDER BY name
      LIMIT ${cap}
      OFFSET ${skip}
    `
    return rows.map((row) => exerciseFromRow(row))
  }

  return {
    driver: 'neon',
    ping,
    hasUsers,
    readState,
    replaceState,
    upsertExercises,
    listExercises,
  }
}
