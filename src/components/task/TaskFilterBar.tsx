import React from "react";
import {
  Search,
  X,
  Kanban,
  LayoutList,
  LayoutGrid,
  Plus,
  ChevronDown,
} from "lucide-react";
import {
  type IWorkspace,
  type IProject,
  type IBoard,
  type TaskStatus,
  type TaskPriority,
  STATUS_META,
  PRIORITY_META,
} from "@/types/task";

export interface TaskFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "kanban" | "table" | "grid";
  onViewModeChange: (mode: "kanban" | "table" | "grid") => void;
  selectedWorkspaceId: string;
  onWorkspaceChange: (id: string) => void;
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  selectedBoardId: string;
  onBoardChange: (id: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  workspaces: IWorkspace[];
  projects: IProject[];
  boards: IBoard[];
  onOpenCreateModal: (columnName?: string) => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedWorkspaceId,
  onWorkspaceChange,
  selectedProjectId,
  onProjectChange,
  selectedBoardId,
  onBoardChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  workspaces,
  projects,
  boards,
  onOpenCreateModal,
}) => {
  return (
    <div className="rounded-2xl border border-[#0F2D29]/12 bg-white p-4 shadow-xs space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title, tags, description..."
            className="w-full rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 pl-10 pr-9 py-2.5 text-[13px] font-medium text-[#0F2D29] outline-none placeholder:text-[#8FA69E] transition-all focus:border-[#0F2D29] focus:bg-white focus:ring-2 focus:ring-[#0F2D29]/10"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-[#8FA69E] hover:text-[#0F2D29] hover:bg-gray-100 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Buttons */}
          <div className="flex items-center rounded-xl border border-[#0F2D29]/12 bg-[#0F2D29]/4 p-1 shadow-2xs">
            <button
              onClick={() => onViewModeChange("kanban")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-all duration-150 ${
                viewMode === "kanban" ? "bg-[#0F2D29] text-white shadow-2xs" : "text-[#5B6E68] hover:text-[#0F2D29]"
              }`}
            >
              <Kanban size={14} /> Kanban
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-all duration-150 ${
                viewMode === "table" ? "bg-[#0F2D29] text-white shadow-2xs" : "text-[#5B6E68] hover:text-[#0F2D29]"
              }`}
            >
              <LayoutList size={14} /> Table
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-all duration-150 ${
                viewMode === "grid" ? "bg-[#0F2D29] text-white shadow-2xs" : "text-[#5B6E68] hover:text-[#0F2D29]"
              }`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
          </div>

          {/* Create Task Button */}
          <button
            onClick={() => onOpenCreateModal("To Do")}
            className="flex items-center gap-2 rounded-xl bg-[#0F2D29] px-4 py-2.5 text-[13px] font-bold text-white shadow-xs hover:bg-[#19403B] hover:-translate-y-0.5 transition-all duration-150 active:translate-y-0"
          >
            <Plus size={16} strokeWidth={2.5} /> New Task
          </button>
        </div>
      </div>

      {/* Filter Dropdowns row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {/* Workspace filter */}
        <div className="relative">
          <select
            value={selectedWorkspaceId}
            onChange={(e) => onWorkspaceChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12px] font-bold text-[#0F2D29] outline-none transition-all focus:border-[#0F2D29] focus:ring-2 focus:ring-[#0F2D29]/10"
          >
            <option value="all">All Workspaces</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
        </div>

        {/* Project filter */}
        <div className="relative">
          <select
            value={selectedProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12px] font-bold text-[#0F2D29] outline-none transition-all focus:border-[#0F2D29] focus:ring-2 focus:ring-[#0F2D29]/10"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
        </div>

        {/* Board filter */}
        <div className="relative">
          <select
            value={selectedBoardId}
            onChange={(e) => onBoardChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12px] font-bold text-[#0F2D29] outline-none transition-all focus:border-[#0F2D29] focus:ring-2 focus:ring-[#0F2D29]/10"
          >
            <option value="all">All Boards</option>
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12px] font-bold text-[#0F2D29] outline-none transition-all focus:border-[#0F2D29] focus:ring-2 focus:ring-[#0F2D29]/10"
          >
            <option value="all">All Statuses</option>
            {(Object.keys(STATUS_META) as TaskStatus[]).map((st) => (
              <option key={st} value={st}>
                {STATUS_META[st].label}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
        </div>

        {/* Priority filter */}
        <div className="relative">
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12px] font-bold text-[#0F2D29] outline-none transition-all focus:border-[#0F2D29] focus:ring-2 focus:ring-[#0F2D29]/10"
          >
            <option value="all">All Priorities</option>
            {(Object.keys(PRIORITY_META) as TaskPriority[]).map((pr) => (
              <option key={pr} value={pr}>
                {PRIORITY_META[pr].label} Priority
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
        </div>
      </div>
    </div>
  );
};
