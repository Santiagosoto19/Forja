import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Plus } from 'lucide-react'
import {
  addCustomExercise,
  addDay,
  addExerciseToDay,
  deleteDay,
  ensureExercise,
  getExerciseById,
  hasOpenSession,
  removeExerciseFromDay,
  renameDay,
  reorderDays,
  reorderExercisesInDay,
  sortedDays,
  updateRoutineExercise,
} from '../storage/store.js'
import { useAppState } from '../context/useAppState.js'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal from '../components/ui/Modal.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import DayEditor from '../components/routines/DayEditor.jsx'
import ExerciseEditor from '../components/routines/ExerciseEditor.jsx'
import ExercisePicker from '../components/routines/ExercisePicker.jsx'

export default function Routines() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const days = sortedDays(state)
  const [selectedId, setSelectedId] = useState(days[0]?.id ?? null)
  const [switching, setSwitching] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const activeId = days.some((day) => day.id === selectedId) ? selectedId : null

  function selectDay(id) {
    if (id === selectedId) {
      setSelectedId(null)
      return
    }
    setSwitching(true)
    setSelectedId(id)
    window.setTimeout(() => setSwitching(false), 280)
  }

  function moveDay(day, direction) {
    const index = days.findIndex((item) => item.id === day.id)
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= days.length) return
    const ids = days.map((item) => item.id)
    ;[ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]]
    reorderDays(ids)
  }

  function moveExercise(day, item, direction) {
    const ordered = [...day.exercises].sort((a, b) => a.order - b.order)
    const index = ordered.findIndex((entry) => entry.id === item.id)
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= ordered.length) return
    const ids = ordered.map((entry) => entry.id)
    ;[ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]]
    reorderExercisesInDay(day.id, ids)
  }

  function handleAddDay() {
    const next = addDay({ name: `Día ${days.length + 1}` })
    const created = [...next.routine.days].sort((a, b) => b.order - a.order)[0]
    if (created) setSelectedId(created.id)
  }

  function handlePick(exercise) {
    if (!activeId) return
    ensureExercise(exercise)
    addExerciseToDay(activeId, {
      exerciseId: exercise.id,
      sets: 3,
      repMin: 8,
      repMax: 12,
      restSeconds: 90,
      notes: '',
    })
    setPickerOpen(false)
  }

  function handleCreate(payload) {
    if (!activeId) return
    const next = addCustomExercise(payload)
    const created = next.exercises.at(-1)
    if (created) {
      addExerciseToDay(activeId, {
        exerciseId: created.id,
        sets: 3,
        repMin: 8,
        repMax: 12,
        restSeconds: 90,
        notes: '',
      })
    }
    setPickerOpen(false)
  }

  function confirmRename() {
    if (!renameTarget) return
    renameDay(renameTarget.id, renameValue)
    setRenameTarget(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    const id = deleteTarget.id
    deleteDay(id)
    if (selectedId === id) setSelectedId(null)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-title">
            <CalendarDays className="h-6 w-6 text-primary" />
            {state.routine.name}
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Edita días y ejercicios. Elige del catálogo o crea uno personalizado.
          </p>
        </div>
        <Button onClick={handleAddDay} size="lg" className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Añadir día
        </Button>
      </div>

      {!days.length ? (
        <EmptyState
          title="No hay días en la rutina"
          description="Añade un día para empezar a construir tu plantilla."
          actionLabel="Añadir día"
          onAction={handleAddDay}
        />
      ) : (
        <div className="space-y-3">
          {days.map((day, index) => {
            const open = hasOpenSession(state, day.id)
            const expanded = activeId === day.id
            const ordered = [...day.exercises].sort((a, b) => a.order - b.order)
            return (
              <DayEditor
                key={day.id}
                day={day}
                expanded={expanded}
                isFirst={index === 0}
                isLast={index === days.length - 1}
                hasOpen={open}
                onSelect={() => selectDay(day.id)}
                onRename={() => {
                  setRenameTarget(day)
                  setRenameValue(day.name)
                }}
                onDelete={() => setDeleteTarget(day)}
                onMove={(direction) => moveDay(day, direction)}
                onTrain={() => navigate(`/entrenar/${day.id}`)}
              >
                {switching && expanded ? (
                  <Skeleton lines={4} />
                ) : (
                  <>
                    {ordered.map((item, itemIndex) => (
                      <ExerciseEditor
                        key={item.id}
                        item={item}
                        exercise={getExerciseById(state, item.exerciseId)}
                        isFirst={itemIndex === 0}
                        isLast={itemIndex === ordered.length - 1}
                        onChange={(patch) => updateRoutineExercise(day.id, item.id, patch)}
                        onRemove={() => removeExerciseFromDay(day.id, item.id)}
                        onMove={(direction) => moveExercise(day, item, direction)}
                      />
                    ))}
                    {!ordered.length ? (
                      <p className="text-sm text-secondary">Este día no tiene ejercicios todavía.</p>
                    ) : null}
                    <Button variant="secondary" onClick={() => setPickerOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Añadir ejercicio
                    </Button>
                  </>
                )}
              </DayEditor>
            )
          })}
        </div>
      )}

      <ExercisePicker
        open={pickerOpen}
        exercises={state.exercises}
        onClose={() => setPickerOpen(false)}
        onPick={handlePick}
        onCreate={handleCreate}
      />

      <Modal
        open={Boolean(renameTarget)}
        title="Renombrar día"
        onClose={() => setRenameTarget(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmRename}>Guardar</Button>
          </>
        }
      >
        <input
          className="input"
          value={renameValue}
          onChange={(event) => setRenameValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') confirmRename()
          }}
        />
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Eliminar día"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-secondary">
          ¿Eliminar «{deleteTarget?.name}» de la plantilla? Las sesiones ya guardadas no se borran.
        </p>
      </Modal>
    </div>
  )
}
