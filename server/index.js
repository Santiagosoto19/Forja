import 'dotenv/config'
import { createServer } from 'node:http'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import { createInitialState } from '../src/storage/store.js'
import { createNeonAdapter } from './neonAdapter.js'
import { createSqliteAdapter } from './sqliteAdapter.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3001
const DATABASE_URL = process.env.DATABASE_URL || ''
const SQLITE_PATH = process.env.SQLITE_PATH || join(__dirname, '..', 'data', 'rutina.db')

const neonHelp =
  'Falta DATABASE_URL o Neon no responde. Crea un proyecto gratis en https://neon.tech, pega la connection string en .env y reinicia npm run dev.'

function createDb() {
  if (DATABASE_URL) return createNeonAdapter(DATABASE_URL)
  return createSqliteAdapter(SQLITE_PATH)
}

const db = createDb()

function dbUnavailableMessage(err) {
  if (db.driver === 'sqlite') {
    return {
      error: 'SQLITE',
      driver: 'sqlite',
      message: err?.message ? `No se pudo usar SQLite: ${err.message}` : 'No se pudo usar SQLite.',
    }
  }
  return {
    error: 'DATABASE_URL',
    driver: 'neon',
    message: err?.message ? `No se pudo usar Neon: ${err.message}` : neonHelp,
  }
}

let pingCache = { at: 0, result: null }
const PING_TTL_MS = 60_000

async function pingDb() {
  const now = Date.now()
  if (pingCache.result?.ok && now - pingCache.at < PING_TTL_MS) {
    return pingCache.result
  }
  try {
    await db.ping()
    pingCache = { at: now, result: { ok: true } }
    return pingCache.result
  } catch (err) {
    pingCache = { at: 0, result: null }
    return { ok: false, error: err.message }
  }
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '12mb' }))

app.get('/api/health', async (_req, res) => {
  const ping = await pingDb()
  if (ping.ok) {
    res.json({ ok: true, db: true, driver: db.driver })
    return
  }
  res.json({
    ok: false,
    db: false,
    driver: db.driver,
    error: ping.error || (db.driver === 'neon' ? 'DATABASE_URL' : 'SQLITE'),
  })
})

app.get('/api/ready', async (_req, res) => {
  const ping = await pingDb()
  if (ping.ok) {
    res.json({ ready: true, db: true, ok: true, driver: db.driver })
    return
  }
  const body = dbUnavailableMessage({ message: ping.error })
  res.status(503).json({ ready: false, db: false, ok: false, ...body })
})

app.get('/api/state', async (_req, res) => {
  try {
    const ping = await pingDb()
    if (!ping.ok) {
      res.status(503).json(dbUnavailableMessage({ message: ping.error }))
      return
    }
    if (!(await db.hasUsers())) {
      const seed = createInitialState()
      await db.replaceState(seed)
      res.json(seed)
      return
    }
    res.json(await db.readState())
  } catch (err) {
    res.status(503).json(dbUnavailableMessage(err))
  }
})

app.put('/api/state', async (req, res) => {
  try {
    const ping = await pingDb()
    if (!ping.ok) {
      res.status(503).json(dbUnavailableMessage({ message: ping.error }))
      return
    }
    const body = req.body
    if (!body || typeof body !== 'object' || !body.user) {
      res.status(400).json({ error: 'INVALID_STATE', message: 'El cuerpo debe ser el estado completo.' })
      return
    }
    await db.replaceState(body)
    res.json({ ok: true, schemaVersion: 1 })
  } catch (err) {
    res.status(503).json(dbUnavailableMessage(err))
  }
})

app.get('/api/exercises', async (req, res) => {
  try {
    const ping = await pingDb()
    if (!ping.ok) {
      res.status(503).json(dbUnavailableMessage({ message: ping.error }))
      return
    }
    if (typeof db.listExercises !== 'function') {
      res.json({ exercises: [] })
      return
    }
    const q = typeof req.query.q === 'string' ? req.query.q : ''
    const muscle = typeof req.query.muscle === 'string' ? req.query.muscle : ''
    const limit = req.query.limit
    const offset = req.query.offset
    const exercises = await db.listExercises({ q, muscle, limit, offset })
    res.json({ exercises })
  } catch (err) {
    res.status(503).json(dbUnavailableMessage(err))
  }
})

function listenOn(host) {
  return new Promise((resolve, reject) => {
    const server = createServer(app)
    server.listen(PORT, host, () => {
      const shown = host.includes(':') ? `[${host}]` : host
      console.log(`API en http://${shown}:${PORT}`)
      resolve(server)
    })
    server.on('error', reject)
  })
}

try {
  await listenOn('127.0.0.1')
  await listenOn('::1')
  if (db.driver === 'sqlite') {
    console.log(`SQLite en ${relative(join(__dirname, '..'), SQLITE_PATH) || SQLITE_PATH}`)
  } else {
    console.log('PostgreSQL Neon (DATABASE_URL)')
  }
  pingDb().catch(() => {})
} catch (err) {
  console.error(err)
  process.exit(1)
}
