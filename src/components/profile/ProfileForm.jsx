import { EXPERIENCE_LABELS, GENDER_LABELS, GOAL_LABELS } from '../../data/seedExercises.js'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'

const inputClass = 'input'

export default function ProfileForm({
  values,
  onChange,
  onSubmit,
  submitLabel = 'Guardar',
  title = 'Tus datos',
}) {
  function setField(field, value) {
    onChange({ ...values, [field]: value })
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-title">{title}</h2>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(values)
        }}
      >
        <label>
          <span className="field-label">Nombre</span>
          <input
            className={inputClass}
            required
            value={values.name}
            onChange={(event) => setField('name', event.target.value)}
          />
        </label>
        <label>
          <span className="field-label">Edad</span>
          <input
            className={inputClass}
            type="number"
            min="12"
            max="90"
            required
            value={values.age ?? ''}
            onChange={(event) => setField('age', Number(event.target.value))}
          />
        </label>
        <label>
          <span className="field-label">Género</span>
          <select
            className={inputClass}
            value={values.gender}
            onChange={(event) => setField('gender', event.target.value)}
          >
            {Object.entries(GENDER_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Altura (cm)</span>
          <input
            className={inputClass}
            type="number"
            min="120"
            max="230"
            required
            value={values.heightCm ?? ''}
            onChange={(event) => setField('heightCm', Number(event.target.value))}
          />
        </label>
        <label>
          <span className="field-label">Nivel</span>
          <select
            className={inputClass}
            value={values.experienceLevel}
            onChange={(event) => setField('experienceLevel', event.target.value)}
          >
            {Object.entries(EXPERIENCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Objetivo</span>
          <select
            className={inputClass}
            value={values.goal}
            onChange={(event) => setField('goal', event.target.value)}
          >
            {Object.entries(GOAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Unidad de peso</span>
          <select
            className={inputClass}
            value={values.weightUnit}
            onChange={(event) => setField('weightUnit', event.target.value)}
          >
            <option value="kg">Kilogramos (kg)</option>
            <option value="lbs">Libras (lbs)</option>
          </select>
        </label>
        {'weight' in values ? (
          <label>
            <span className="field-label">Peso actual ({values.weightUnit})</span>
            <input
              className={inputClass}
              type="number"
              min="30"
              step="0.1"
              required
              value={values.weight ?? ''}
              onChange={(event) => setField('weight', Number(event.target.value))}
            />
          </label>
        ) : null}
        <div className="md:col-span-2">
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}
