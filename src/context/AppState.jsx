import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import SetupNeon from '../components/ui/SetupNeon.jsx'
import { PageSkeleton } from '../components/ui/Skeleton.jsx'
import {
  enablePersist,
  hydrate,
  persistNow,
  subscribe,
  update as updateStore,
} from '../storage/store.js'

export const AppStateContext = createContext(null)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(url, options = {}, attempts = 4) {
  const started = Date.now()
  const totalMs = 45000
  const perAttemptMs = 20000
  let lastRes
  for (let i = 0; i < attempts; i += 1) {
    const remaining = totalMs - (Date.now() - started)
    if (remaining <= 0) break
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), Math.min(perAttemptMs, remaining))
    try {
      const res = await fetch(url, { ...options, signal: controller.signal })
      lastRes = res
      if (res.ok) return res
      const body = await res.clone().json().catch(() => null)
      if (res.status === 503 && body) return res
    } catch {
      /* API o proxy aún no listos / timeout */
    } finally {
      clearTimeout(timer)
    }
    const remainingAfter = totalMs - (Date.now() - started)
    if (remainingAfter <= 0 || i === attempts - 1) break
    await sleep(Math.min(200, remainingAfter))
  }
  if (lastRes) return lastRes
  throw new Error('API no disponible. ¿Arrancaste npm run dev?')
}

function isNeonFailure(body) {
  return body?.driver === 'neon' || body?.error === 'DATABASE_URL'
}

function LoadError({ error, onRetry }) {
  return (
    <div className="app-shell flex min-h-dvh items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl p-6">
        <p className="text-sm font-semibold text-danger">Forja</p>
        <h1 className="mt-1 text-2xl font-bold text-title">No se pudo cargar</h1>
        <p className="mt-3 text-sm text-secondary">{error}</p>
        {onRetry ? (
          <Button className="mt-6" onClick={onRetry}>
            Reintentar
          </Button>
        ) : null}
      </Card>
    </div>
  )
}

export function AppStateProvider({ children }) {
  const [state, setState] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => subscribe(setState), [])

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const readyRes = await fetchWithRetry('/api/ready')
      const readyBody = await readyRes.json().catch(() => ({}))
      if (!readyRes.ok || readyBody.db === false || readyBody.ready === false || readyBody.ok === false) {
        if (isNeonFailure(readyBody)) {
          setStatus('setup')
          setError(readyBody.message || readyBody.error || 'DATABASE_URL')
          return
        }
        setStatus('error')
        setError(readyBody.message || readyBody.error || 'API no disponible')
        return
      }

      const res = await fetchWithRetry('/api/state')
      if (res.status === 503) {
        const body = await res.json().catch(() => ({}))
        if (isNeonFailure(body)) {
          setStatus('setup')
          setError(body.message || body.error || 'DATABASE_URL')
          return
        }
        setStatus('error')
        setError(body.message || body.error || 'No se pudo leer el estado')
        return
      }
      if (!res.ok) {
        throw new Error(`GET /api/state ${res.status}`)
      }
      const data = await res.json()
      hydrate(data)
      enablePersist()
      setState(data)
      setStatus('ready')
    } catch (err) {
      setStatus('error')
      setError(err?.message || 'No se pudo conectar con la API')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const update = useCallback((updater, options) => updateStore(updater, options), [])

  const value = useMemo(
    () => ({ state, update, status, persistNow, reload: load }),
    [state, update, status, load],
  )

  if (status === 'loading') return <PageSkeleton />
  if (status === 'setup') return <SetupNeon error={error} onRetry={load} />
  if (status === 'error') return <LoadError error={error} onRetry={load} />

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
