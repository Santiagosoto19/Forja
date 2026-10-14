import { useEffect, useState } from 'react'
import { Dumbbell } from 'lucide-react'

export default function ExerciseThumb({ src, alt = '', className = '' }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return (
      <span
        className={`flex items-center justify-center bg-surface-2 text-secondary ${className}`}
        aria-hidden="true"
      >
        <Dumbbell className="h-5 w-5 opacity-40" />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`bg-surface-2 object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
