import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskEmptyStateProps {
  onCreateTask?: () => void;
  hasActiveFilters?: boolean;
}

export const TaskEmptyState = ({
  onCreateTask,
  hasActiveFilters,
}: TaskEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#0F2D29]/20 bg-white/80 p-16 text-center shadow-xs">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F2D29]/8 text-[#0F2D29] shadow-2xs">
      <ClipboardList className="h-7 w-7 text-[#0F2D29]" />
    </div>
    <div className="space-y-1">
      <p className="text-base font-bold text-[#0F2D29]">
        {hasActiveFilters ? "No tasks match your filters" : "No tasks yet"}
      </p>
      <p className="text-xs font-medium text-[#5B6E68]">
        {hasActiveFilters
          ? "Try adjusting or clearing your active search and filter controls."
          : "Create your first task to kick off project execution."}
      </p>
    </div>
    {!hasActiveFilters && onCreateTask && (
      <Button
        size="sm"
        onClick={onCreateTask}
        className="mt-3 rounded-xl bg-[#0F2D29] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#19403B]"
      >
        Create Task
      </Button>
    )}
  </div>
);
