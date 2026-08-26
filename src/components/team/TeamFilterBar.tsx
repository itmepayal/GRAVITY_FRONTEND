import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Kanban,
  Filter,
  X,
  Building2,
  Users,
} from "lucide-react";
import type { TeamViewMode, TeamSizeFilter } from "./types";
import { FONT_GOLDMAN } from "@/components/common/design-system";

interface WorkspaceOption {
  id: string;
  name: string;
}

interface TeamFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  workspaces: WorkspaceOption[];
  selectedWorkspaceId: string;
  onWorkspaceSelect: (id: string) => void;
  sizeFilter: TeamSizeFilter;
  onSizeFilterChange: (filter: TeamSizeFilter) => void;
  viewMode: TeamViewMode;
  onViewModeChange: (mode: TeamViewMode) => void;
  onOpenCreate: () => void;
  isLoadingWorkspaces?: boolean;
  teamCount?: number;
}

export const TeamFilterBar: React.FC<TeamFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  workspaces,
  selectedWorkspaceId,
  onWorkspaceSelect,
  sizeFilter,
  onSizeFilterChange,
  viewMode,
  onViewModeChange,
  onOpenCreate,
  isLoadingWorkspaces,
  teamCount = 0,
}) => {
  return (
    <div className="flex flex-col gap-4 border border-[#0F2D29]/15 bg-white p-4 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
          />
          <input
            id="team-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search teams... (Press '/')"
            className="w-full border border-[#0F2D29]/15 bg-white py-2 pr-8 pl-9 text-[12.5px] font-semibold text-[#0F2D29] outline-none transition focus:border-[#0F2D29]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E] hover:text-[#0F2D29]"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {workspaces.length > 0 && (
          <div className="flex items-center gap-1.5 border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5B6E68]">
            <Building2 size={14} className="text-[#0F2D29]" />
            <select
              value={selectedWorkspaceId}
              onChange={(e) => onWorkspaceSelect(e.target.value)}
              disabled={isLoadingWorkspaces}
              className="bg-transparent font-bold text-[#0F2D29] outline-none cursor-pointer disabled:opacity-50"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5 border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5B6E68]">
          <Filter size={14} className="text-[#0F2D29]" />
          <select
            value={sizeFilter}
            onChange={(e) =>
              onSizeFilterChange(e.target.value as TeamSizeFilter)
            }
            className="bg-transparent font-bold text-[#0F2D29] outline-none cursor-pointer capitalize"
          >
            <option value="all">All Sizes</option>
            <option value="small">Small (1–3)</option>
            <option value="medium">Medium (4–8)</option>
            <option value="large">Large (9+)</option>
          </select>
        </div>

        <span className="hidden items-center gap-1.5 bg-[#E7F5EF] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0F8A65] sm:flex">
          <Users size={11} />
          {teamCount} team{teamCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <div className="flex border border-[#0F2D29]/15 bg-[#0F2D29]/5 p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold transition ${FONT_GOLDMAN} ${
              viewMode === "grid"
                ? "bg-[#0F2D29] text-white shadow-2xs"
                : "text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
            title="Grid view"
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold transition ${FONT_GOLDMAN} ${
              viewMode === "table"
                ? "bg-[#0F2D29] text-white shadow-2xs"
                : "text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
            title="Table view"
          >
            <List size={14} />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold transition ${FONT_GOLDMAN} ${
              viewMode === "kanban"
                ? "bg-[#0F2D29] text-white shadow-2xs"
                : "text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
            title="Kanban view"
          >
            <Kanban size={14} />
            <span className="hidden sm:inline">Kanban</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className={`flex items-center gap-2 bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold text-white shadow-2xs hover:bg-[#081E1B] transition ${FONT_GOLDMAN}`}
        >
          <Plus size={15} strokeWidth={2.5} />
          New Team
        </button>
      </div>
    </div>
  );
};
