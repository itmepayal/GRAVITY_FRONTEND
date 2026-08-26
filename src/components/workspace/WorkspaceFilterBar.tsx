import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Kanban,
  Filter,
  X,
  LayoutDashboard,
  Target,
  Building2,
} from "lucide-react";
import type {
  WorkspaceViewMode,
  VisibilityFilter,
  RoleFilter,
} from "./types";
import { FONT_GOLDMAN } from "@/components/common/design-system";

export interface WorkspaceFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeSection: "workspace" | "goals";
  onSectionChange: (section: "workspace" | "goals") => void;
  visibilityFilter: VisibilityFilter;
  onVisibilityFilterChange: (filter: VisibilityFilter) => void;
  roleFilter: RoleFilter;
  onRoleFilterChange: (filter: RoleFilter) => void;
  viewMode: WorkspaceViewMode;
  onViewModeChange: (mode: WorkspaceViewMode) => void;
  workspaceCount?: number;
  onOpenCreateModal: () => void;
}

export const WorkspaceFilterBar: React.FC<WorkspaceFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeSection,
  onSectionChange,
  visibilityFilter,
  onVisibilityFilterChange,
  roleFilter,
  onRoleFilterChange,
  viewMode,
  onViewModeChange,
  workspaceCount = 0,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col gap-4 border border-[#0F2D29]/15 bg-white p-4 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
          />
          <input
            id="workspace-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search workspaces... (Press '/')"
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

        <div className="inline-flex items-center border border-[#0F2D29]/15 bg-[#0F2D29]/5 p-0.5">
          <button
            type="button"
            onClick={() => onSectionChange("workspace")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold transition ${FONT_GOLDMAN} ${
              activeSection === "workspace"
                ? "bg-[#0F2D29] text-white shadow-2xs"
                : "text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
          >
            <LayoutDashboard size={14} />
            <span className="hidden sm:inline">Workspaces</span>
          </button>
          <button
            type="button"
            onClick={() => onSectionChange("goals")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold transition ${FONT_GOLDMAN} ${
              activeSection === "goals"
                ? "bg-[#0F2D29] text-white shadow-2xs"
                : "text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
          >
            <Target size={14} />
            <span className="hidden sm:inline">Goals</span>
          </button>
        </div>

        {activeSection === "workspace" && (
          <>
            <div className="flex items-center gap-1.5 border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5B6E68]">
              <Filter size={14} className="text-[#0F2D29]" />
              <select
                value={visibilityFilter}
                onChange={(e) =>
                  onVisibilityFilterChange(e.target.value as VisibilityFilter)
                }
                className="bg-transparent font-bold text-[#0F2D29] outline-none cursor-pointer capitalize"
              >
                <option value="all">All Visibility</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5B6E68]">
              <Building2 size={14} className="text-[#0F2D29]" />
              <select
                value={roleFilter}
                onChange={(e) =>
                  onRoleFilterChange(e.target.value as RoleFilter)
                }
                className="bg-transparent font-bold text-[#0F2D29] outline-none cursor-pointer capitalize"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <span className="hidden items-center gap-1.5 bg-[#E7F5EF] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0F8A65] sm:flex">
              <Building2 size={11} />
              {workspaceCount} space{workspaceCount === 1 ? "" : "s"}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        {activeSection === "workspace" && (
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
            <button
              type="button"
              onClick={() => onViewModeChange("detail")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold transition ${FONT_GOLDMAN} ${
                viewMode === "detail"
                  ? "bg-[#0F2D29] text-white shadow-2xs"
                  : "text-[#5B6E68] hover:text-[#0F2D29]"
              }`}
              title="Detail inspector"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Detail</span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenCreateModal}
          className={`flex items-center gap-2 bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold text-white shadow-2xs hover:bg-[#081E1B] transition ${FONT_GOLDMAN}`}
        >
          <Plus size={15} strokeWidth={2.5} />
          New Workspace
        </button>
      </div>
    </div>
  );
};
