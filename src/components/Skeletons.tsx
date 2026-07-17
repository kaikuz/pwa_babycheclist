export function ChecklistSkeleton() {
  return (
    <div className="space-y-4 px-4 pt-4">
      <div className="skeleton h-40" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton h-48" />
      ))}
    </div>
  )
}

export function DocumentsSkeleton() {
  return (
    <div className="space-y-3 px-4 pt-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton h-16" />
      ))}
    </div>
  )
}
