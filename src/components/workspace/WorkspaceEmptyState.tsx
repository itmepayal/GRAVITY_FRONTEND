import type { FC } from "react";
import { Building2, Plus } from "lucide-react";
import { FONT_GOLDMAN } from "@/components/common/design-system";

interface WorkspaceEmptyStateProps {
  hasActiveFilters: boolean;
  onCreateWorkspace: () => void;
}

export const WorkspaceEmptyState: FC<WorkspaceEmptyStateProps> = ({
  hasActiveFilters,
  onCreateWorkspace,
}) => (
  <div className="flex min-h-80 flex-col items-center justify-center border border-dashed border-[#0F2D29]/20 bg-white px-8 py-14 text-center shadow-2xs">
    <div className="mb-5 flex h-16 w-16 items-center justify-center bg-[#E7F5EF]">
      <Building2 size={28} className="text-[#0F8A65]" />
    </div>
    <h2 className={`text-base font-black text-[#0F2D29] ${FONT_GOLDMAN}`}>
      {hasActiveFilters ? "No workspaces match your filters" : "No workspaces yet"}
    </h2>
    <p className="mt-1.5 max-w-xs text-xs font-medium text-[#5B6E68]">
      {hasActiveFilters
        ? "Try adjusting search, visibility, or role filters to find your spaces."
        : "Create your first workspace to organize projects, teammates, and goals."}
    </p>
    {!hasActiveFilters && (
      <button
        type="button"
        onClick={onCreateWorkspace}
        className={`mt-6 flex items-center gap-1.5 bg-[#0F2D29] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#081E1B] transition ${FONT_GOLDMAN}`}
      >
        <Plus size={13} />
        Create Workspace
      </button>
    )}
  </div>
);
