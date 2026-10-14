import { Trophy } from 'lucide-react'

export default function PrToast({ message, onClose }) {
  if (!message) return null

  return (
    <button
      type="button"
      onClick={onClose}
      className="pr-toast fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-success px-4 py-3 text-sm font-semibold text-canvas shadow-[0_0_18px_rgb(16_185_129_/_0.45)]"
    >
      <Trophy className="h-4 w-4" />
      {message}
    </button>
  )
}
