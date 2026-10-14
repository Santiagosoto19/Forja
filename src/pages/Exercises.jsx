import { useCallback, useEffect, useState } from 'react'
import { Search, StretchHorizontal } from 'lucide-react'
import { addExerciseToDay, ensureExercise, sortedDays } from '../storage/store.js'
import { useAppState } from '../context/useAppState.js'
import ExerciseCard from '../components/exercises/ExerciseCard.jsx'
import ExerciseDetailModal from '../components/exercises/ExerciseDetailModal.jsx'
import { MUSCLE_CHIPS } from '../components/exercises/exerciseMedia.js'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'

const PAGE_SIZE = 40

export default function Exercises() {
  const { state } = useAppState()
  const days = sortedDays(state)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [items, setItems] = useState([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  const load = useCallback(async ({ q, muscle, start }) => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (muscle !== 'all') params.set('muscle', muscle)
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String(start))
    const res = await fetch(`/api/exercises?${params.toString()}`)
    if (!res.ok) throw new Error('No se pudo cargar el catálogo')
    const body = await res.json()
    return Array.isArray(body.exercises) ? body.exercises : []
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    const timer = window.setTimeout(async () => {
      try {
        const next = await load({ q: query, muscle: group, start: 0 })
        if (cancelled) return
        setItems(next)
        setOffset(next.length)
        setHasMore(next.length >= PAGE_SIZE)
      } catch (err) {
        if (!cancelled) {
          setItems([])
          setHasMore(false)
          setError(err?.message || 'No se pudo cargar el catálogo')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 180)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query, group, load])

  async function handleLoadMore() {
    setLoadingMore(true)
    setError('')
    try {
      const next = await load({ q: query, muscle: group, start: offset })
      setItems((prev) => [...prev, ...next])
      setOffset((prev) => prev + next.length)
      setHasMore(next.length >= PAGE_SIZE)
    } catch (err) {
      setError(err?.message || 'No se pudo cargar más')
    } finally {
      setLoadingMore(false)
    }
  }

  function handleAddToDay(dayId, exercise) {
    ensureExercise(exercise)
    addExerciseToDay(dayId, {
      exerciseId: exercise.id,
      sets: 3,
      repMin: 8,
      repMax: 12,
      restSeconds: 90,
      notes: '',
    })
  }

  const emptyCatalog = !loading && !items.length && !query.trim() && group === 'all' && !error

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-title">
          <StretchHorizontal className="h-6 w-6 text-primary" />
          Biblioteca
        </h1>
        <p className="mt-1 text-sm text-secondary">Ejercicios con imagen, grupo y equipo.</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <input
          className="input pl-9"
          placeholder="Buscar ejercicio"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {MUSCLE_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setGroup(chip.id)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              group === chip.id ? 'bg-primary/15 text-primary' : 'bg-surface-2 text-secondary'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full" />
          ))}
        </div>
      ) : emptyCatalog ? (
        <EmptyState
          title="No hay catálogo"
          description="Importa el catálogo con npm run import:exercises"
        />
      ) : !items.length ? (
        <EmptyState
          title="Sin resultados"
          description="No hay ejercicios con ese filtro."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} onOpen={setSelected} />
            ))}
          </div>
          {hasMore ? (
            <div className="flex justify-center pt-2">
              <Button variant="secondary" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Cargando…' : 'Cargar más'}
              </Button>
            </div>
          ) : null}
        </>
      )}

      {error ? <p className="text-center text-sm text-danger">{error}</p> : null}

      <ExerciseDetailModal
        open={Boolean(selected)}
        exercise={selected}
        onClose={() => setSelected(null)}
        days={days}
        onAddToDay={handleAddToDay}
      />
    </div>
  )
}
