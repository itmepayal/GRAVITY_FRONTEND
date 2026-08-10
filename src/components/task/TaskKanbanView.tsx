import React, { useState } from "react";
import { Plus } from "lucide-react";
import { type ITask } from "@/types/task";
import { TaskCard } from "./TaskCard";

export interface TaskKanbanViewProps {
  columns: string[];
  tasks: ITask[];
  onOpenTask: (taskId: string) => void;
  onOpenCreateModal: (columnName: string) => void;
  onDropTaskToColumn: (taskId: string, columnName: string) => void;
}

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  columns,
  tasks,
  onOpenTask,
  onOpenCreateModal,
  onDropTaskToColumn,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDrop = (colName: string) => {
    if (draggedTaskId) {
      onDropTaskToColumn(draggedTaskId, colName);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6">
      {columns.map((colName) => {
        const colTasks = tasks.filter((t) => t.column === colName);
        const isOver = dragOverColumn === colName;

        return (
          <div
            key={colName}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(colName);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={() => handleDrop(colName)}
            className={`flex w-80 shrink-0 flex-col border border-[#0F2D29]/12 border-t-2 border-t-[#0F2D29] bg-white/90 p-4 shadow-2xs transition-all ${
              isOver ? "border-[#0F2D29] bg-[#0F2D29]/5 ring-1 ring-[#0F2D29]" : ""
            }`}
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between pb-2 border-b border-[#0F2D29]/8">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-[#0F2D29]">{colName}</h3>
                <span className="flex h-5 w-5 items-center justify-center bg-[#0F2D29] text-[11px] font-bold text-white">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onOpenCreateModal(colName)}
                className="flex h-7 w-7 items-center justify-center text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Tasks List */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[70vh] pr-1">
              {colTasks.length === 0 ? (
                <div className="flex h-24 items-center justify-center border border-dashed border-[#0F2D29]/15 p-4 text-center text-[12px] font-medium text-[#8FA69E]">
                  No tasks in {colName}
                </div>
              ) : (
                colTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onOpen={() => onOpenTask(t.id)}
                    onDragStart={() => setDraggedTaskId(t.id)}
                    isDragging={draggedTaskId === t.id}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
