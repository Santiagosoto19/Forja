import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { exerciseFromRow, isCatalogSource } from '../src/lib/exerciseFields.js'
import { EXERCISE_UPSERT_SQL, exerciseRowValues, sqliteEnsureExerciseColumns } from './exerciseColumns.js'
import { rowsToState, stateToRows } from './stateMapper.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaSql = readFileSync(join(__dirname, 'schema.sqlite.sql'), 'utf8')

function schemaStatements() {
  return schemaSql
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

function sqlValue(value) {
  if (value === undefined) return null
  if (typeof value === 'boolean') return value ? 1 : 0
  return value
}

function asRows(stmt) {
  return stmt.all().map((row) => ({ ...row }))
}

function insertEach(db, sql, rows, valuesFn) {
  if (!rows?.length) return
  const stmt = db.prepare(sql)
  for (const row of rows) {
    stmt.run(...valuesFn(row).map(sqlValue))
  }
}

function usedExerciseIds(db) {
  const fromRoutine = asRows(
    db.prepare('SELECT DISTINCT exercise_id AS id FROM routine_exercises WHERE exercise_id IS NOT NULL'),
  )
  const fromSessions = asRows(
    db.prepare('SELECT DISTINCT exercise_id AS id FROM session_entries WHERE exercise_id IS NOT NULL'),
  )
  return new Set([...fromRoutine, ...fromSessions].map((row) => row.id))
}

function stateExercises(db) {
  const rows = asRows(db.prepare('SELECT * FROM exercises'))
  const used = usedExerciseIds(db)
  return rows.filter((row) => !isCatalogSource(row.source) || used.has(row.id))
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

export function createSqliteAdapter(filePath) {
  if (filePath !== ':memory:') {
    mkdirSync(dirname(filePath), { recursive: true })
  }

  const db = new DatabaseSync(filePath)
  db.exec('PRAGMA foreign_keys = ON')
  for (const statement of schemaStatements()) {
    db.exec(statement)
  }
  sqliteEnsureExerciseColumns(db)

  function ping() {
    db.prepare('SELECT 1 AS ok').get()
    return { ok: true }
  }

  function hasUsers() {
    return Boolean(db.prepare('SELECT id FROM users LIMIT 1').get())
  }

  function readState() {
    return rowsToState({
      users: asRows(db.prepare('SELECT * FROM users')),
      bodyLogs: asRows(db.prepare('SELECT * FROM body_logs ORDER BY date')),
      exercises: stateExercises(db),
      routines: asRows(db.prepare('SELECT * FROM routines')),
      routineDays: asRows(db.prepare('SELECT * FROM routine_days ORDER BY sort_order')),
      routineExercises: asRows(db.prepare('SELECT * FROM routine_exercises ORDER BY sort_order')),
      sessions: asRows(db.prepare('SELECT * FROM sessions ORDER BY started_at')),
      sessionEntries: asRows(db.prepare('SELECT * FROM session_entries')),
      sessionSets: asRows(db.prepare('SELECT * FROM session_sets ORDER BY set_number')),
    })
  }

  function replaceState(state) {
    const rows = stateToRows(state)
    db.exec('BEGIN')
    try {
      db.exec('DELETE FROM sessions')
      db.exec('DELETE FROM routines')
      db.exec("DELETE FROM exercises WHERE COALESCE(source, '') != 'dataset'")
      db.exec('DELETE FROM body_logs')
      db.exec('DELETE FROM users')

      insertEach(
        db,
        `INSERT INTO users (id, name, age, gender, height_cm, experience_level, goal, weight_unit, onboarding_complete)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        rows.users,
        (row) => [
          row.id,
          row.name,
          row.age,
          row.gender,
          row.height_cm,
          row.experience_level,
          row.goal,
          row.weight_unit,
          row.onboarding_complete ? 1 : 0,
        ],
      )
      insertEach(
        db,
        'INSERT INTO body_logs (id, date, weight_kg) VALUES (?, ?, ?)',
        rows.bodyLogs,
        (row) => [row.id, row.date, row.weight_kg],
      )
      insertEach(db, EXERCISE_UPSERT_SQL, rows.exercises, (row) => exerciseRowValues(row, true))
      insertEach(
        db,
        'INSERT INTO routines (id, name) VALUES (?, ?)',
        rows.routines,
        (row) => [row.id, row.name],
      )
      insertEach(
        db,
        'INSERT INTO routine_days (id, routine_id, name, sort_order) VALUES (?, ?, ?, ?)',
        rows.routineDays,
        (row) => [row.id, row.routine_id, row.name, row.sort_order],
      )
      insertEach(
        db,
        `INSERT INTO routine_exercises (id, day_id, exercise_id, sets, rep_min, rep_max, rest_seconds, notes, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        rows.routineExercises,
        (row) => [
          row.id,
          row.day_id,
          row.exercise_id,
          row.sets,
          row.rep_min,
          row.rep_max,
          row.rest_seconds,
          row.notes,
          row.sort_order,
        ],
      )
      insertEach(
        db,
        'INSERT INTO sessions (id, day_id, started_at, completed_at) VALUES (?, ?, ?, ?)',
        rows.sessions,
        (row) => [row.id, row.day_id, row.started_at, row.completed_at],
      )
      insertEach(
        db,
        'INSERT INTO session_entries (id, session_id, routine_exercise_id, exercise_id) VALUES (?, ?, ?, ?)',
        rows.sessionEntries,
        (row) => [row.id, row.session_id, row.routine_exercise_id, row.exercise_id],
      )
      insertEach(
        db,
        `INSERT INTO session_sets (id, entry_id, set_number, reps, weight_kg, rpe, rir, completed, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        rows.sessionSets,
        (row) => [
          row.id,
          row.entry_id,
          row.set_number,
          row.reps,
          row.weight_kg,
          row.rpe,
          row.rir,
          row.completed ? 1 : 0,
          row.completed_at,
        ],
      )
      db.exec('COMMIT')
    } catch (err) {
      db.exec('ROLLBACK')
      throw err
    }
  }

  function upsertExercises(exercises = []) {
    insertEach(db, EXERCISE_UPSERT_SQL, exercises, (row) => exerciseRowValues(row, true))
    return exercises.length
  }

  function listExercises({ q = '', muscle = '', limit = 40, offset = 0 } = {}) {
    const cap = clampLimit(limit)
    const skip = clampOffset(offset)
    const clauses = []
    const params = []
    const query = String(q || '').trim().toLowerCase()
    if (query) {
      clauses.push('(LOWER(name) LIKE ? OR LOWER(COALESCE(target, \'\')) LIKE ?)')
      const like = `%${query}%`
      params.push(like, like)
    }
    const group = String(muscle || '').trim()
    if (group && group !== 'all') {
      clauses.push('muscle_group = ?')
      params.push(group)
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const stmt = db.prepare(
      `SELECT * FROM exercises ${where} ORDER BY name COLLATE NOCASE LIMIT ? OFFSET ?`,
    )
    return stmt.all(...params, cap, skip).map((row) => exerciseFromRow(row))
  }

  return {
    driver: 'sqlite',
    filePath,
    ping,
    hasUsers,
    readState,
    replaceState,
    upsertExercises,
    listExercises,
    close: () => db.close(),
  }
}
