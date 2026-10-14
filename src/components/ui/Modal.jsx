import { useEffect } from 'react'

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  className = '',
  zClass = 'z-50',
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={`fixed inset-0 ${zClass} flex items-end justify-center p-4 md:items-center`}>
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-soft ${className}`}
      >
        {title ? <h2 className="mb-3 text-lg font-semibold text-title">{title}</h2> : null}
        <div>{children}</div>
        {footer ? <div className="mt-4 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}
