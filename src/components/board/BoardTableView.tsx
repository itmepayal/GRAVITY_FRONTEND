import React from "react";
import { Kanban, Plus, Columns3, ListTodo, ExternalLink } from "lucide-react";
import { type BoardItem, TYPE_META, initials } from "./types";

export interface BoardTableViewProps {
  boards: BoardItem[];
  onSelectBoard: (board: BoardItem) => void;
  onOpenCreate: () => void;
}

export const BoardTableView: React.FC<BoardTableViewProps> = ({
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
    <div className="overflow-x-auto border border-[#0F2D29]/15 bg-white shadow-2xs">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-[#0F2D29]/10 bg-[#0F2D29]/5 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68] font-['Goldman',sans-serif]">
          <tr>
            <th className="px-4 py-3.5">Board</th>
            <th className="px-4 py-3.5">Type</th>
            <th className="px-4 py-3.5">Project</th>
            <th className="px-4 py-3.5">Columns</th>
            <th className="px-4 py-3.5">Tasks</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#0F2D29]/8">
          {boards.map((board) => {
            const meta = TYPE_META[board.type];
            const TypeIcon = meta.icon;

            return (
              <tr
                key={board.id}
                onClick={() => onSelectBoard(board)}
                className="group cursor-pointer transition-colors hover:bg-[#0F2D29]/4"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#0F2D29] font-['Goldman',sans-serif] text-[12px] font-bold text-white shadow-2xs">
                      {initials(board.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-['Goldman',sans-serif] text-[14px] font-bold text-[#0F2D29]">
                        {board.name}
                      </p>
                      <p className="max-w-xs truncate text-[11.5px] font-medium text-[#5B6E68]">
                        {board.description || "No description"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className="inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider font-['Goldman',sans-serif]"
                    style={{
                      color: meta.color,
                      backgroundColor: meta.bg,
                      borderColor: meta.border,
                    }}
                  >
                    <TypeIcon size={12} />
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-[#0F2D29]">{board.projectName}</p>
                  <p className="text-[11px] text-[#8FA69E]">{board.workspaceName}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1 font-semibold text-[#5B6E68]">
                    <Columns3 size={13} className="text-[#0F2D29]" />
                    {board.columns.length}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1 font-semibold text-[#5B6E68]">
                    <ListTodo size={13} className="text-[#0F2D29]" />
                    {board.tasksCount}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBoard(board);
                    }}
                    className="inline-flex items-center gap-1 font-['Goldman',sans-serif] text-[12px] font-bold text-[#0F2D29] opacity-0 transition group-hover:opacity-100"
                  >
                    View <ExternalLink size={12} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
