import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  X,
  Trash2,
  Columns3,
  ListTodo,
  Building2,
  FolderKanban,
  Kanban,
  ArrowRight,
} from "lucide-react";
import { type BoardItem, TYPE_META, initials } from "./types";

export interface BoardDetailDrawerProps {
  board: BoardItem;
  onClose: () => void;
  onDelete: (boardId: string) => void;
  onUpdateType: (boardId: string, type: BoardItem["type"]) => void;
}

export const BoardDetailDrawer: React.FC<BoardDetailDrawerProps> = ({
  board,
  onClose,
  onDelete,
  onUpdateType,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "columns">("overview");
  const meta = TYPE_META[board.type];
  const TypeIcon = meta.icon;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0F2D29]/50 backdrop-blur-md transition-all">
      <div className="fixed inset-0" onClick={onClose} />

      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-[#0F2D29] bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-[#0F2D29] p-6 text-white sm:p-7">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#8FE3C4] font-['Goldman',sans-serif] text-[15px] font-bold text-[#0F2D29] shadow-2xs">
              {initials(board.name)}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-['Goldman',sans-serif] text-[18px] font-bold text-white">
                {board.name}
              </h2>
              <p className="text-[12px] font-semibold text-[#B7CFC7]">
                {board.projectName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#B7CFC7] transition hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-[#0F2D29]/10 bg-[#0F2D29]/4 px-6 py-3">
          <div className="flex items-center gap-2">
            <select
              value={board.type}
              onChange={(e) =>
                onUpdateType(board.id, e.target.value as BoardItem["type"])
              }
              className="cursor-pointer border border-[#0F2D29]/20 bg-white px-3 py-1.5 font-['Goldman',sans-serif] text-[12px] font-bold uppercase text-[#0F2D29] outline-none"
            >
              <option value="kanban">Kanban</option>
              <option value="scrum">Scrum</option>
            </select>
            <span
              className="inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-bold uppercase"
              style={{
                color: meta.color,
                backgroundColor: meta.bg,
                borderColor: meta.border,
              }}
            >
              <TypeIcon size={11} />
              {meta.label}
            </span>
          </div>
          <button
            onClick={() => onDelete(board.id)}
            className="flex items-center gap-1.5 border border-red-200 bg-red-50 px-3 py-1.5 font-['Goldman',sans-serif] text-[12px] font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>

        <div className="flex border-b border-[#0F2D29]/10 bg-white px-6">
          {(["overview", "columns"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-3 font-['Goldman',sans-serif] text-[13px] font-bold capitalize transition ${
                activeTab === tab
                  ? "border-[#0F2D29] text-[#0F2D29]"
                  : "border-transparent text-[#5B6E68] hover:text-[#0F2D29]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" ? (
            <div className="space-y-6">
              <p className="text-[13.5px] leading-relaxed text-[#5B6E68]">
                {board.description || "No description provided for this board."}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#0F2D29]/10 bg-[#0F2D29]/3 p-4">
                  <p className="font-['Goldman',sans-serif] text-[10px] font-bold uppercase tracking-wider text-[#8FA69E]">
                    Workspace
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 font-semibold text-[#0F2D29]">
                    <Building2 size={14} />
                    {board.workspaceName}
                  </p>
                </div>
                <div className="border border-[#0F2D29]/10 bg-[#0F2D29]/3 p-4">
                  <p className="font-['Goldman',sans-serif] text-[10px] font-bold uppercase tracking-wider text-[#8FA69E]">
                    Project
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 font-semibold text-[#0F2D29]">
                    <FolderKanban size={14} />
                    {board.projectName}
                  </p>
                </div>
                <div className="border border-[#0F2D29]/10 bg-[#0F2D29]/3 p-4">
                  <p className="font-['Goldman',sans-serif] text-[10px] font-bold uppercase tracking-wider text-[#8FA69E]">
                    Columns
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 font-semibold text-[#0F2D29]">
                    <Columns3 size={14} />
                    {board.columns.length} workflow stages
                  </p>
                </div>
                <div className="border border-[#0F2D29]/10 bg-[#0F2D29]/3 p-4">
                  <p className="font-['Goldman',sans-serif] text-[10px] font-bold uppercase tracking-wider text-[#8FA69E]">
                    Tasks
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 font-semibold text-[#0F2D29]">
                    <ListTodo size={14} />
                    {board.tasksCount} active tasks
                  </p>
                </div>
              </div>

              <Link
                to={`/dashboard/tasks?board=${board.id}`}
                className="flex w-full items-center justify-center gap-2 bg-[#0F2D29] py-3 font-['Goldman',sans-serif] text-[13px] font-bold text-white transition hover:bg-[#081E1B]"
              >
                <Kanban size={15} />
                Open Tasks on this Board
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {board.columns.map((col, i) => (
                <div
                  key={col}
                  className="flex items-center justify-between border border-[#0F2D29]/10 bg-white px-4 py-3"
                >
                  <span className="font-['Goldman',sans-serif] text-[13px] font-bold text-[#0F2D29]">
                    {col}
                  </span>
                  <span className="text-[11px] font-semibold text-[#8FA69E]">
                    Stage {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
};
