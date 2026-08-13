import { cn } from "@/lib/utils";
import type { ViewMode } from "@/hooks/useTasksState";

const shimmer = "animate-pulse rounded-md bg-muted";

const SkeletonCard = () => (
  <div className="space-y-3 rounded-lg border bg-card p-4">
    <div className={cn(shimmer, "h-4 w-3/4")} />
    <div className={cn(shimmer, "h-3 w-full")} />
    <div className={cn(shimmer, "h-3 w-2/3")} />
    <div className="flex items-center justify-between pt-2">
      <div className={cn(shimmer, "h-6 w-6 rounded-full")} />
      <div className={cn(shimmer, "h-3 w-10")} />
    </div>
  </div>
);

const KanbanSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto pb-2">
    {Array.from({ length: 4 }).map((_, colIdx) => (
      <div key={colIdx} className="w-72 shrink-0 space-y-3">
        <div className={cn(shimmer, "h-5 w-24")} />
        {Array.from({ length: 3 }).map((_, cardIdx) => (
          <SkeletonCard key={cardIdx} />
        ))}
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="overflow-hidden rounded-lg border">
    <div className="grid grid-cols-5 gap-4 border-b bg-muted/50 p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={cn(shimmer, "h-3 w-16")} />
      ))}
    </div>
    {Array.from({ length: 6 }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        className="grid grid-cols-5 gap-4 border-b p-3 last:border-b-0"
      >
        {Array.from({ length: 5 }).map((_, colIdx) => (
          <div key={colIdx} className={cn(shimmer, "h-4 w-full")} />
        ))}
      </div>
    ))}
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

interface TaskLoadingSkeletonProps {
  viewMode: ViewMode;
}

export const TaskLoadingSkeleton = ({ viewMode }: TaskLoadingSkeletonProps) => {
  if (viewMode === "table") return <TableSkeleton />;
  if (viewMode === "grid") return <GridSkeleton />;
  return <KanbanSkeleton />;
};
