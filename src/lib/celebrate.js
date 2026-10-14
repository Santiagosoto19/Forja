async function loadConfetti() {
  const mod = await import('canvas-confetti')
  return mod.default
}

export async function celebratePr() {
  try {
    const confetti = await loadConfetti()
    const defaults = { disableForReducedMotion: true }
    confetti({
      ...defaults,
      particleCount: 140,
      spread: 92,
      startVelocity: 48,
      origin: { y: 0.55 },
      colors: ['#00F0FF', '#2563EB', '#10B981', '#F9FAFB'],
    })
    confetti({
      ...defaults,
      particleCount: 70,
      angle: 60,
      spread: 58,
      origin: { x: 0, y: 0.7 },
    })
    confetti({
      ...defaults,
      particleCount: 70,
      angle: 120,
      spread: 58,
      origin: { x: 1, y: 0.7 },
    })
  } catch {
    // canvas-confetti no debe romper la sesión
  }
}

export async function celebrateExercise() {
  try {
    const confetti = await loadConfetti()
    confetti({
      disableForReducedMotion: true,
      particleCount: 42,
      spread: 48,
      startVelocity: 26,
      scalar: 0.8,
      origin: { y: 0.72 },
      colors: ['#00F0FF', '#10B981', '#2563EB'],
    })
  } catch {
    // ignore
  }
}
