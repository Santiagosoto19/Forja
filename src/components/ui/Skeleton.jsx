export default function Skeleton({ className = '', lines = 0 }) {
  if (lines > 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="skeleton-pulse h-4 rounded-lg bg-border"
            style={{ width: `${Math.max(42, 100 - index * 10)}%` }}
          />
        ))}
      </div>
    )
  }

  return <div className={`skeleton-pulse rounded-[14px] bg-border/80 ${className}`} />
}

export function PageSkeleton() {
  return (
    <div className="app-shell min-h-dvh px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-72" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}

export function ChartSkeleton({ className = 'h-64' }) {
  const bars = [38, 62, 48, 78, 54, 70, 44, 66]
  return (
    <div className={`skeleton-pulse flex items-end gap-2 rounded-[14px] bg-canvas px-3 py-4 ${className}`}>
      {bars.map((height, index) => (
        <div key={index} className="flex-1 rounded-t-md bg-border" style={{ height: `${height}%` }} />
      ))}
    </div>
  )
}
