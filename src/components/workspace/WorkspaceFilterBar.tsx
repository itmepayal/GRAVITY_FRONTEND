import React from "react";
import { Search, Plus, LayoutGrid, Table, LayoutDashboard, Target, X } from "lucide-react";

export interface WorkspaceFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeSection: "workspace" | "goals";
  onSectionChange: (section: "workspace" | "goals") => void;
  viewMode: "grid" | "table" | "detail";
  onViewModeChange: (mode: "grid" | "table" | "detail") => void;
  totalWorkspaces: number;
  onOpenCreateModal: () => void;
}

export const WorkspaceFilterBar: React.FC<WorkspaceFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeSection,
  onSectionChange,
  viewMode,
  onViewModeChange,
  totalWorkspaces,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col gap-4 border border-[#0F2D29]/12 bg-white p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
      {/* Search Input & Section Toggle */}
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search workspaces... (Press '/' to focus)"
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

        {/* Section Toggle */}
        <div className="inline-flex items-center border border-[#0F2D29]/15 bg-[#0F2D29]/5 p-0.5">
          <button
            onClick={() => onSectionChange("workspace")}
            className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] transition ${
              activeSection === "workspace"
                ? "bg-[#0F2D29] text-white"
                : "text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
          >
            <LayoutDashboard size={14} />
            Workspaces
          </button>
          <button
            onClick={() => onSectionChange("goals")}
            className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] transition ${
              activeSection === "goals"
                ? "bg-[#0F2D29] text-white"
                : "text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
          >
            <Target size={14} />
            Goals
          </button>
        </div>
      </div>

      {/* View Switcher & Create Workspace Trigger */}
      <div className="flex items-center gap-3 shrink-0">
        {/* View Switcher */}
        {activeSection === "workspace" && (
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
            <button
              onClick={() => onViewModeChange("detail")}
              title="Detail Inspector"
              className={`flex h-8 w-8 items-center justify-center transition ${
                viewMode === "detail"
                  ? "bg-[#0F2D29] text-white"
                  : "text-[#5B6E68] hover:text-[#0F2D29]"
              }`}
            >
              <LayoutDashboard size={15} />
            </button>
          </div>
        )}

        {/* Create Workspace Button */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 bg-[#0F2D29] text-white px-4 py-2 text-[13px] font-extrabold font-['Goldman',sans-serif] tracking-wide hover:bg-[#081E1B] transition shadow-2xs"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Workspace
        </button>
      </div>
    </div>
  );
};
