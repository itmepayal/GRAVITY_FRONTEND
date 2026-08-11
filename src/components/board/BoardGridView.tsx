import React from "react";
import { Kanban, Plus, ListTodo, Columns3, ArrowRight } from "lucide-react";
import { type BoardItem, TYPE_META, initials } from "./types";

export interface BoardGridViewProps {
  boards: BoardItem[];
  onSelectBoard: (board: BoardItem) => void;
  onOpenCreate: () => void;
}

export const BoardGridView: React.FC<BoardGridViewProps> = ({
  boards,
  onSelectBoard,
  onOpenCreate,
}) => {
  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-[#0F2D29]/20 bg-white px-6 py-16 text-center shadow-2xs">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-[#0F2D29]/10 text-[#0F2D29]">
          <Kanban size={26} />
        </div>
        <h3 className="text-[17px] font-bold font-['Goldman',sans-serif] text-[#0F2D29]">
          No Boards Found
        </h3>
        <p className="mt-1.5 max-w-sm text-[13px] font-medium text-[#5B6E68]">
          No boards match your active search and filter criteria.
        </p>
        <button
          onClick={onOpenCreate}
          className="mt-5 inline-flex items-center gap-2 bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif] text-white shadow-2xs transition hover:bg-[#081E1B]"
        >
          <Plus size={15} strokeWidth={2.5} />
          Create New Board
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => {
        const meta = TYPE_META[board.type];
        const TypeIcon = meta.icon;

        return (
          <div
            key={board.id}
            onClick={() => onSelectBoard(board)}
            className="group relative flex cursor-pointer flex-col justify-between border border-[#0F2D29]/15 bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#0F2D29] hover:shadow-md"
          >
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#0F2D29] font-['Goldman',sans-serif] text-[13px] font-bold text-white shadow-2xs">
                    {initials(board.name)}
                  </div>
                  <span className="truncate text-[12px] font-bold text-[#5B6E68]">
                    {board.projectName}
                  </span>
                </div>
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider font-['Goldman',sans-serif]"
                  style={{
                    color: meta.color,
                    backgroundColor: meta.bg,
                    borderColor: meta.border,
                  }}
                >
                  <TypeIcon size={12} />
                  {meta.label}
                </span>
              </div>

              <h3 className="truncate font-['Goldman',sans-serif] text-[18px] font-bold text-[#0F2D29]">
                {board.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-relaxed text-[#5B6E68]">
                {board.description || "No description provided for this board."}
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {board.columns.slice(0, 4).map((col) => (
                  <span
                    key={col}
                    className="border border-[#0F2D29]/10 bg-[#0F2D29]/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5B6E68]"
                  >
                    {col}
                  </span>
                ))}
                {board.columns.length > 4 && (
                  <span className="px-1 text-[10px] font-bold text-[#8FA69E]">
                    +{board.columns.length - 4}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#0F2D29]/10 pt-4">
              <div className="flex items-center gap-3 text-[12px] font-semibold text-[#5B6E68]">
                <span className="flex items-center gap-1">
                  <Columns3 size={14} className="text-[#0F2D29]" />
                  {board.columns.length} cols
                </span>
                <span className="flex items-center gap-1">
                  <ListTodo size={14} className="text-[#0F2D29]" />
                  {board.tasksCount} tasks
                </span>
              </div>
              <span className="flex items-center gap-1 font-['Goldman',sans-serif] text-[11.5px] font-bold text-[#0F2D29] transition-transform group-hover:translate-x-0.5">
                Open <ArrowRight size={12} />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
