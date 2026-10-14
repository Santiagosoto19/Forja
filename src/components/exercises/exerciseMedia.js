export function isVideoUrl(url) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(url || ''))
}

export function formatInstructionText(value) {
  if (value == null || value === '') return ''
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean).join('\n')
  const text = String(value).trim()
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean).join('\n')
      }
    } catch {
      /* texto plano */
    }
  }
  return text
}

export function exerciseInstructions(exercise) {
  const es = formatInstructionText(exercise?.instructionsEs)
  if (es) return es
  return formatInstructionText(exercise?.instructionsEn)
}

export const MUSCLE_CHIPS = [
  { id: 'all', label: 'Todos' },
  { id: 'chest', label: 'Pecho' },
  { id: 'back', label: 'Espalda' },
  { id: 'legs', label: 'Pierna' },
  { id: 'shoulders', label: 'Hombro' },
  { id: 'arms', label: 'Brazos' },
  { id: 'core', label: 'Core' },
]
