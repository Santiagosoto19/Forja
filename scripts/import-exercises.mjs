#!/usr/bin/env node
import 'dotenv/config'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exerciseToRow } from '../src/lib/exerciseFields.js'
import { toCatalogExercise } from '../src/lib/muscleTaxonomy.js'
import { createNeonAdapter } from '../server/neonAdapter.js'
import { createSqliteAdapter } from '../server/sqliteAdapter.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATASET_URL =
  process.env.EXERCISES_JSON_URL ||
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json'
const SQLITE_PATH = process.env.SQLITE_PATH || join(ROOT, 'data', 'rutina.db')
const DATABASE_URL = process.env.DATABASE_URL || ''

async function downloadJson(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`No se pudo descargar el dataset (${res.status}): ${url}`)
  }
  return res.json()
}

function asRows(records) {
  return records.map((record) => exerciseToRow(toCatalogExercise(record)))
}

async function loadRecords() {
  const localPath = process.env.EXERCISES_JSON_PATH
  if (localPath) {
    return JSON.parse(readFileSync(localPath, 'utf8'))
  }
  const url = DATASET_URL
  if (url.startsWith('file:')) {
    return JSON.parse(readFileSync(new URL(url), 'utf8'))
  }
  console.log('Descargando catálogo de ejercicios…')
  return downloadJson(url)
}

async function main() {
  const records = await loadRecords()
  if (!Array.isArray(records) || !records.length) {
    throw new Error('El JSON del dataset no es un array de ejercicios.')
  }

  mkdirSync(join(ROOT, 'data'), { recursive: true })
  writeFileSync(join(ROOT, 'data', 'exercises.json'), JSON.stringify(records))
  const rows = asRows(records)
  console.log(`${rows.length} ejercicios mapeados.`)

  if (DATABASE_URL) {
    console.log('Upsert en Neon (DATABASE_URL)…')
    const db = createNeonAdapter(DATABASE_URL)
    await db.ping()
    const count = await db.upsertExercises(rows)
    console.log(`Listo: ${count} filas en PostgreSQL.`)
    return
  }

  console.log(`Upsert en SQLite (${SQLITE_PATH})…`)
  const db = createSqliteAdapter(SQLITE_PATH)
  try {
    const count = db.upsertExercises(rows)
    console.log(`Listo: ${count} filas en SQLite. No se tocaron ejercicios seed/custom.`)
  } finally {
    db.close()
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
