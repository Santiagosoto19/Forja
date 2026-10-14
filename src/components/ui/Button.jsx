const variants = {
  primary:
    'bg-primary text-canvas shadow-[0_0_18px_rgb(0_240_255_/_0.28)] hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.99]',
  secondary: 'bg-surface-2 text-title border border-border hover:border-primary/40 hover:scale-[1.02]',
  ghost: 'text-secondary hover:bg-surface-2',
  success: 'bg-success text-white hover:bg-success/90 hover:scale-[1.02] active:scale-[0.99]',
  danger: 'bg-danger text-white hover:bg-danger/90 hover:scale-[1.02] active:scale-[0.99]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-3 text-sm',
  lg: 'min-h-12 px-5 py-3.5 text-base',
  icon: 'p-2 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
