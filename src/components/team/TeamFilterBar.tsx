import React from "react";
import {
  Search,
  Plus,
  LayoutGrid,
  Table,
  Building2,
  X,
} from "lucide-react";
import type { TeamViewMode } from "./types";

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
  viewMode: TeamViewMode;
  onViewModeChange: (mode: TeamViewMode) => void;
  onOpenCreate: () => void;
  isLoadingWorkspaces?: boolean;
}

export const TeamFilterBar: React.FC<TeamFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  workspaces,
  selectedWorkspaceId,
  onWorkspaceSelect,
  viewMode,
  onViewModeChange,
  onOpenCreate,
  isLoadingWorkspaces,
}) => {
  return (
    <div className="flex flex-col gap-4 border border-[#0F2D29]/12 bg-white p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
      {/* Search Input & Workspace Filter */}
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-60 flex-1 sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
          />
          <input
            id="team-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search teams... (Press '/' to focus)"
            className="w-full border border-[#0F2D29]/15 bg-white py-2 pr-8 pl-9 text-[13px] font-semibold text-[#0F2D29] outline-none placeholder:text-[#8FA69E] focus:border-[#0F2D29]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E] hover:text-[#0F2D29]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Workspace Select */}
        {workspaces.length > 0 && (
          <div className="relative min-w-[200px]">
            <Building2
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
            />
            <select
              value={selectedWorkspaceId}
              onChange={(e) => onWorkspaceSelect(e.target.value)}
              disabled={isLoadingWorkspaces}
              className="w-full border border-[#0F2D29]/15 bg-white py-2 pl-9 pr-8 text-[13px] font-semibold text-[#0F2D29] outline-none focus:border-[#0F2D29] disabled:opacity-50 appearance-none cursor-pointer"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8FA69E]">
              ▼
            </div>
          </div>
        )}
      </div>

      {/* View Switcher & Action Button */}
      <div className="flex items-center gap-3 shrink-0">
        {/* View Switcher */}
        <div className="inline-flex items-center border border-[#0F2D29]/15 bg-[#0F2D29]/5 p-0.5">
          <button
            onClick={() => onViewModeChange("grid")}
            title="Grid View"
            className={`flex h-8 w-8 items-center justify-center transition ${
              viewMode === "grid"
                ? "bg-[#0F2D29] text-white"
                : "text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            title="Table View"
            className={`flex h-8 w-8 items-center justify-center transition ${
              viewMode === "table"
                ? "bg-[#0F2D29] text-white"
                : "text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
          >
            <Table size={15} />
          </button>
        </div>

        {/* Create Team Button */}
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 bg-[#0F2D29] text-white px-4 py-2 text-[13px] font-extrabold font-['Goldman',sans-serif] tracking-wide hover:bg-[#081E1B] transition shadow-2xs"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Team
        </button>
      </div>
    </div>
  );
};
