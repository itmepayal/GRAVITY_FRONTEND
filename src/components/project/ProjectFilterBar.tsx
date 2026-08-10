import React from "react";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Kanban,
  Filter,
  X,
  Building2,
} from "lucide-react";
import type { ProjectStatus } from "./types";

export type ProjectViewMode = "grid" | "table" | "kanban";

export interface ProjectFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedWorkspaceId: string;
  onWorkspaceChange: (id: string) => void;
  workspaces: { id: string; name: string }[];
  selectedStatus: "all" | ProjectStatus;
  onStatusChange: (status: "all" | ProjectStatus) => void;
  viewMode: ProjectViewMode;
  onViewModeChange: (mode: ProjectViewMode) => void;
  onOpenCreateModal: () => void;
}

export const ProjectFilterBar: React.FC<ProjectFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedWorkspaceId,
  onWorkspaceChange,
  workspaces,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col gap-4 border border-[#0F2D29]/15 bg-white p-4 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
      {/* Left: Search & Filter Dropdowns */}
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Bar */}
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
          />
          <input
            id="project-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects... (Press '/')"
            className="w-full border border-[#0F2D29]/15 bg-white py-2 pr-8 pl-9 text-[12.5px] font-semibold text-[#0F2D29] outline-none transition focus:border-[#0F2D29]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E] hover:text-[#0F2D29]"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Workspace Dropdown */}
        <div className="flex items-center gap-1.5 border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5B6E68]">
          <Building2 size={14} className="text-[#0F2D29]" />
          <select
            value={selectedWorkspaceId}
            onChange={(e) => onWorkspaceChange(e.target.value)}
            className="bg-transparent font-bold text-[#0F2D29] outline-none cursor-pointer"
          >
            <option value="all">All Workspaces</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-1.5 border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5B6E68]">
          <Filter size={14} className="text-[#0F2D29]" />
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="bg-transparent font-bold text-[#0F2D29] outline-none cursor-pointer capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Right: View Mode Toggle & Add Button */}
      <div className="flex items-center justify-between gap-3 lg:justify-end">
        {/* View Switcher */}
        <div className="flex border border-[#0F2D29]/15 bg-[#0F2D29]/5 p-0.5">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] transition ${
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
            onClick={() => onViewModeChange("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] transition ${
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
            onClick={() => onViewModeChange("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] transition ${
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

        {/* Primary Action Button */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif] text-white shadow-2xs hover:bg-[#081E1B] transition"
        >
          <Plus size={15} strokeWidth={2.5} />
          New Project
        </button>
      </div>
    </div>
  );
};
