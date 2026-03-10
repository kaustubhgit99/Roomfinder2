import { Skeleton } from '@/components/ui/skeleton'

export function RoomSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 bg-card">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-9 w-full rounded-xl mt-2" />
      </div>
    </div>
  )
}

export function RoomGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => <RoomSkeleton key={i} />)}
    </div>
  )
}
