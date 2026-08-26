import type { FC } from "react";
import type { TeamViewMode } from "./types";

interface TeamLoadingSkeletonProps {
  viewMode: TeamViewMode;
}

export const TeamLoadingSkeleton: FC<TeamLoadingSkeletonProps> = ({
  viewMode,
}) => {
  if (viewMode === "table") {
    return (
      <div className="border border-[#0F2D29]/15 bg-white p-6 shadow-2xs">
        <div className="h-6 w-full animate-pulse bg-[#0F2D29]/10" />
        <div className="mt-4 h-12 w-full animate-pulse bg-[#0F2D29]/5" />
        <div className="mt-2 h-12 w-full animate-pulse bg-[#0F2D29]/5" />
        <div className="mt-2 h-12 w-full animate-pulse bg-[#0F2D29]/5" />
      </div>
    );
  }

  if (viewMode === "kanban") {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map((col) => (
          <div
            key={col}
            className="w-72 shrink-0 border border-[#0F2D29]/15 bg-[#0F2D29]/2 p-4"
          >
            <div className="mb-4 h-5 w-32 animate-pulse bg-[#0F2D29]/10" />
            <div className="space-y-3">
              <div className="h-36 animate-pulse border border-[#0F2D29]/10 bg-white" />
              <div className="h-36 animate-pulse border border-[#0F2D29]/10 bg-white" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-52 animate-pulse border border-[#0F2D29]/12 bg-white p-6"
        >
          <div className="h-5 w-3/4 bg-[#0F2D29]/10" />
          <div className="mt-3 h-4 w-full bg-[#0F2D29]/5" />
          <div className="mt-2 h-4 w-2/3 bg-[#0F2D29]/5" />
          <div className="mt-8 h-2 w-full bg-[#0F2D29]/10" />
        </div>
      ))}
    </div>
  );
};
