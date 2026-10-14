import { useEffect, useMemo, useState } from 'react'
import { Eye, Plus, Search } from 'lucide-react'
import { MUSCLE_LABELS } from '../../data/seedExercises.js'
import Button from '../ui/Button.jsx'
import Modal from '../ui/Modal.jsx'
import Badge from '../ui/Badge.jsx'
import ExerciseDetailModal from '../exercises/ExerciseDetailModal.jsx'
import ExerciseThumb from '../exercises/ExerciseThumb.jsx'

const GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core']

export default function ExercisePicker({ open, exercises, onClose, onPick, onCreate }) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [creating, setCreating] = useState(false)
  const [custom, setCustom] = useState({ name: '', muscleGroup: 'chest', equipment: '' })
  const [catalog, setCatalog] = useState([])
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    if (!open) return undefined
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (group !== 'all') params.set('muscle', group)
    params.set('limit', '60')
    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/exercises?${params.toString()}`)
        if (!res.ok || cancelled) return
        const body = await res.json()
        if (!cancelled) setCatalog(Array.isArray(body.exercises) ? body.exercises : [])
      } catch {
        if (!cancelled) setCatalog([])
      }
    }, 180)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, query, group])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const byId = new Map()
    for (const exercise of catalog) byId.set(exercise.id, exercise)
    for (const exercise of exercises || []) {
      if (byId.has(exercise.id)) continue
      if (group !== 'all' && exercise.muscleGroup !== group) continue
      if (q && !exercise.name.toLowerCase().includes(q)) continue
      byId.set(exercise.id, exercise)
    }
    return [...byId.values()]
  }, [catalog, exercises, query, group])

  function reset() {
    setQuery('')
    setGroup('all')
    setCreating(false)
    setCustom({ name: '', muscleGroup: 'chest', equipment: '' })
    setDetail(null)
  }

  function handleClose() {
    reset()
    onClose?.()
  }

  function handlePickerClose() {
    if (detail) {
      setDetail(null)
      return
    }
    handleClose()
  }

  function handleCreate(event) {
    event.preventDefault()
    if (!custom.name.trim()) return
    onCreate?.({
      name: custom.name.trim(),
      muscleGroup: custom.muscleGroup,
      equipment: custom.equipment.trim() || 'otro',
    })
    reset()
  }

  function pickExercise(exercise) {
    onPick(exercise)
    reset()
  }

  return (
    <>
    <Modal open={open} title="Añadir ejercicio" onClose={handlePickerClose} className="max-w-lg">
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <input
          className="input pl-9"
          placeholder="Buscar por nombre"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setGroup('all')}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
            group === 'all' ? 'bg-primary/15 text-primary' : 'bg-surface-2 text-secondary'
          }`}
        >
          Todos
        </button>
        {GROUPS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setGroup(key)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              group === key ? 'bg-primary/15 text-primary' : 'bg-surface-2 text-secondary'
            }`}
          >
            {MUSCLE_LABELS[key]}
          </button>
        ))}
      </div>
      <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
        {filtered.map((exercise) => (
          <div
            key={exercise.id}
            className="flex w-full items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 transition-colors hover:border-primary/30 hover:bg-surface-2"
          >
            <button
              type="button"
              className="shrink-0"
              aria-label={`Ver ${exercise.name}`}
              onClick={() => setDetail(exercise)}
            >
              <ExerciseThumb src={exercise.imageUrl} alt="" className="h-10 w-10 rounded-lg" />
            </button>
            <button
              type="button"
              onClick={() => pickExercise(exercise)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block truncate font-medium text-title">{exercise.name}</span>
            </button>
            <button
              type="button"
              aria-label="Ver detalle"
              onClick={() => setDetail(exercise)}
              className="rounded-lg p-1.5 text-secondary hover:bg-canvas hover:text-primary"
            >
              <Eye className="h-4 w-4" />
            </button>
            <Badge>{MUSCLE_LABELS[exercise.muscleGroup] || exercise.muscleGroup}</Badge>
          </div>
        ))}
        {!filtered.length ? (
          <p className="px-2 py-6 text-center text-sm text-secondary">No hay ejercicios con ese filtro.</p>
        ) : null}
      </div>
      <div className="mt-3 border-t border-border pt-3">
        {creating ? (
          <form className="space-y-2" onSubmit={handleCreate}>
            <label>
              <span className="field-label">Nombre</span>
              <input
                className="input"
                required
                value={custom.name}
                onChange={(event) => setCustom({ ...custom, name: event.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className="field-label">Grupo</span>
                <select
                  className="input"
                  value={custom.muscleGroup}
                  onChange={(event) => setCustom({ ...custom, muscleGroup: event.target.value })}
                >
                  {GROUPS.map((key) => (
                    <option key={key} value={key}>
                      {MUSCLE_LABELS[key]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-label">Equipo</span>
                <input
                  className="input"
                  placeholder="barra, mancuernas…"
                  value={custom.equipment}
                  onChange={(event) => setCustom({ ...custom, equipment: event.target.value })}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear y añadir</Button>
            </div>
          </form>
        ) : (
          <Button variant="secondary" className="w-full" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Crear personalizado
          </Button>
        )}
      </div>
    </Modal>
    <ExerciseDetailModal
      open={Boolean(detail)}
      exercise={detail}
      onClose={() => setDetail(null)}
    />
    </>
  )
}
