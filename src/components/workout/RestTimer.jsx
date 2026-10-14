import { useEffect, useRef, useState } from 'react'
import { Timer } from 'lucide-react'
import Button from '../ui/Button.jsx'

function formatClock(total) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.07
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.stop(ctx.currentTime + 0.2)
    osc.onended = () => ctx.close?.()
  } catch {
    // Web Audio puede fallar en algunos navegadores
  }
}

function vibrateShort() {
  try {
    navigator.vibrate?.(160)
  } catch {
    // ignore
  }
}

export default function RestTimer({ seconds, onClose }) {
  const [left, setLeft] = useState(seconds)
  const onCloseRef = useRef(onClose)
  const alertedRef = useRef(false)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          window.clearInterval(interval)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (left !== 0) return undefined
    if (!alertedRef.current) {
      alertedRef.current = true
      playBeep()
      vibrateShort()
    }
    const t = window.setTimeout(() => onCloseRef.current?.(), 2000)
    return () => window.clearTimeout(t)
  }, [left])

  const ready = left === 0
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const progress = seconds ? Math.max(0, left / seconds) : 0

  return (
    <div
      className={`fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md rounded-2xl border p-4 pb-5 md:bottom-6 ${
        ready ? 'rest-ready border-danger' : 'card-surface glow-cyan border-primary/40'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 112 112" className={`h-24 w-24 -rotate-90 ${ready ? '' : 'rest-ring'}`}>
            <circle cx="56" cy="56" r={radius} fill="none" stroke="#1F2937" strokeWidth="8" />
            <circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke={ready ? '#EF4444' : '#00F0FF'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <Timer
            className={`absolute inset-0 m-auto h-6 w-6 ${ready ? 'text-danger' : 'text-primary'}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">Descanso</p>
          <p className={`text-3xl font-bold ${ready ? 'text-danger' : 'text-title'}`}>
            {ready ? '¡Listo!' : formatClock(left)}
          </p>
          <Button variant="secondary" className="mt-3 w-full" onClick={onClose}>
            Omitir
          </Button>
        </div>
      </div>
    </div>
  )
}
