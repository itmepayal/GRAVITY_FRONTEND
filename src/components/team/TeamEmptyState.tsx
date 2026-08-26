import type { FC } from "react";
import { Users, Plus } from "lucide-react";
import { FONT_GOLDMAN } from "@/components/common/design-system";

interface TeamEmptyStateProps {
  hasActiveFilters: boolean;
  onCreateTeam: () => void;
}

export const TeamEmptyState: FC<TeamEmptyStateProps> = ({
  hasActiveFilters,
  onCreateTeam,
}) => (
  <div className="flex min-h-80 flex-col items-center justify-center border border-dashed border-[#0F2D29]/20 bg-white px-8 py-14 text-center shadow-2xs">
    <div className="mb-5 flex h-16 w-16 items-center justify-center bg-[#E7F5EF]">
      <Users size={28} className="text-[#0F8A65]" />
    </div>
    <h2 className={`text-base font-black text-[#0F2D29] ${FONT_GOLDMAN}`}>
      {hasActiveFilters ? "No teams match your filters" : "No teams yet"}
    </h2>
    <p className="mt-1.5 max-w-xs text-xs font-medium text-[#5B6E68]">
      {hasActiveFilters
        ? "Try adjusting your search or size filter to find teams in this workspace."
        : "Create your first team to organize members and assign leads across projects."}
    </p>
    {!hasActiveFilters && (
      <button
        type="button"
        onClick={onCreateTeam}
        className={`mt-6 flex items-center gap-1.5 bg-[#0F2D29] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#081E1B] transition ${FONT_GOLDMAN}`}
      >
        <Plus size={13} />
        Create Team
      </button>
    )}
  </div>
);
