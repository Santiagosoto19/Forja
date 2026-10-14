export default function Card({ className = '', hover = false, ...props }) {
  return (
    <div
      className={`card-surface rounded-[14px] p-4 ${
        hover ? 'transition-transform duration-150 hover:scale-[1.02]' : ''
      } ${className}`}
      {...props}
    />
  )
}
