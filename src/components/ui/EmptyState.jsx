import Button from './Button.jsx'

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-[14px] border border-dashed border-border bg-surface px-6 py-10 text-center">
      <h3 className="text-base font-semibold text-title">{title}</h3>
      {description ? <p className="mt-2 text-sm text-secondary">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
