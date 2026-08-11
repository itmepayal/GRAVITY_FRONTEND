import React from "react";
import { Plus, ListTodo, ArrowRight, Columns3 } from "lucide-react";
import { type BoardItem, type BoardType, TYPE_META, initials } from "./types";

export interface BoardKanbanViewProps {
  boards: BoardItem[];
  onSelectBoard: (board: BoardItem) => void;
  onOpenCreate: () => void;
}

const KANBAN_COLUMNS: BoardType[] = ["kanban", "scrum"];

export const BoardKanbanView: React.FC<BoardKanbanViewProps> = ({
  boards,
  onSelectBoard,
  onOpenCreate,
}) => {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {KANBAN_COLUMNS.map((colType) => {
        const meta = TYPE_META[colType];
        const TypeIcon = meta.icon;
        const colBoards = boards.filter((b) => b.type === colType);

        return (
          <div
            key={colType}
            className="flex flex-col border border-[#0F2D29]/15 bg-[#0F2D29]/2 p-4 shadow-2xs"
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#0F2D29]/10 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center border"
                  style={{
                    color: meta.color,
                    backgroundColor: meta.bg,
                    borderColor: meta.border,
                  }}
                >
                  <TypeIcon size={14} />
                </span>
                <h4 className="font-['Goldman',sans-serif] text-[14px] font-bold text-[#0F2D29]">
                  {meta.label} Boards
                </h4>
              </div>
              <span className="flex h-5 min-w-5 items-center justify-center bg-[#0F2D29] px-1.5 font-['Goldman',sans-serif] text-[10.5px] font-bold text-white">
                {colBoards.length}
              </span>
            </div>

            <div className="min-h-64 flex-1 space-y-3">
              {colBoards.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center border border-dashed border-[#0F2D29]/15 bg-white p-4 text-center">
                  <p className="text-[12px] font-semibold text-[#5B6E68]">
                    No {meta.label.toLowerCase()} boards
                  </p>
                </div>
              ) : (
                colBoards.map((board) => (
                  <div
                    key={board.id}
                    onClick={() => onSelectBoard(board)}
                    className="group flex cursor-pointer flex-col justify-between border border-[#0F2D29]/15 bg-white p-4 shadow-2xs transition hover:border-[#0F2D29]"
                  >
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center bg-[#0F2D29] font-['Goldman',sans-serif] text-[10px] font-bold text-white">
                          {initials(board.name)}
                        </div>
                        <span className="truncate text-[11px] font-bold text-[#5B6E68]">
                          {board.projectName}
                        </span>
                      </div>
                      <h5 className="truncate font-['Goldman',sans-serif] text-[15px] font-bold text-[#0F2D29]">
                        {board.name}
                      </h5>
                      {board.description && (
                        <p className="mt-1 line-clamp-2 text-[12px] font-medium text-[#5B6E68]">
                          {board.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#0F2D29]/10 pt-2.5 text-[11.5px] font-semibold text-[#5B6E68]">
                      <span className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Columns3 size={12} className="text-[#0F2D29]" />
                          {board.columns.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <ListTodo size={12} className="text-[#0F2D29]" />
                          {board.tasksCount}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 font-['Goldman',sans-serif] font-bold text-[#0F2D29] transition-transform group-hover:translate-x-0.5">
                        Open <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={onOpenCreate}
              className="mt-3 flex w-full items-center justify-center gap-1.5 border border-dashed border-[#0F2D29]/20 py-2.5 text-[12px] font-bold text-[#5B6E68] transition hover:border-[#0F2D29] hover:text-[#0F2D29]"
            >
              <Plus size={13} />
              Add {meta.label} Board
            </button>
          </div>
        );
      })}
    </div>
  );
};
