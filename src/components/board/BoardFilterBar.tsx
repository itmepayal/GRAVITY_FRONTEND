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
  FolderKanban,
} from "lucide-react";
import type { BoardType } from "./types";

export type BoardViewMode = "grid" | "table" | "kanban";

export interface BoardFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedWorkspaceId: string;
  onWorkspaceChange: (id: string) => void;
  workspaces: { id: string; name: string }[];
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  projects: { id: string; name: string }[];
  selectedType: "all" | BoardType;
  onTypeChange: (type: "all" | BoardType) => void;
  viewMode: BoardViewMode;
  onViewModeChange: (mode: BoardViewMode) => void;
  onOpenCreateModal: () => void;
}

export const BoardFilterBar: React.FC<BoardFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedWorkspaceId,
  onWorkspaceChange,
  workspaces,
  selectedProjectId,
  onProjectChange,
  projects,
  selectedType,
  onTypeChange,
  viewMode,
  onViewModeChange,
  onOpenCreateModal,
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
            id="board-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search boards... (Press '/')"
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

        <div className="flex items-center gap-1.5 border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5B6E68]">
          <Building2 size={14} className="text-[#0F2D29]" />
          <select
            value={selectedWorkspaceId}
            onChange={(e) => onWorkspaceChange(e.target.value)}
            className="cursor-pointer bg-transparent font-bold text-[#0F2D29] outline-none"
          >
            <option value="all">All Workspaces</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5B6E68]">
          <FolderKanban size={14} className="text-[#0F2D29]" />
          <select
            value={selectedProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="cursor-pointer bg-transparent font-bold text-[#0F2D29] outline-none"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5B6E68]">
          <Filter size={14} className="text-[#0F2D29]" />
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as "all" | BoardType)}
            className="cursor-pointer bg-transparent font-bold capitalize text-[#0F2D29] outline-none"
          >
            <option value="all">All Types</option>
            <option value="kanban">Kanban</option>
            <option value="scrum">Scrum</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <div className="flex border border-[#0F2D29]/15 bg-[#0F2D29]/5 p-0.5">
          {(
            [
              ["grid", LayoutGrid, "Grid"],
              ["table", List, "Table"],
              ["kanban", Kanban, "Kanban"],
            ] as const
          ).map(([mode, Icon, label]) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] transition ${
                viewMode === mode
                  ? "bg-[#0F2D29] text-white shadow-2xs"
                  : "text-[#5B6E68] hover:text-[#0F2D29]"
              }`}
              title={`${label} view`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif] text-white shadow-2xs transition hover:bg-[#081E1B]"
        >
          <Plus size={15} strokeWidth={2.5} />
          New Board
        </button>
      </div>
    </div>
  );
};
