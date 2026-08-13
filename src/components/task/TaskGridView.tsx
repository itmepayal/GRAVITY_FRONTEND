import React from "react";
import { type ITask } from "@/types/task";
import { TaskCard } from "./TaskCard";

export interface TaskGridViewProps {
  tasks: ITask[];
  onOpenTask: (taskId: string) => void;
}

export const TaskGridView: React.FC<TaskGridViewProps> = ({ tasks, onOpenTask }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tasks.length === 0 ? (
        <div className="col-span-full rounded-2xl border border-[#0F2D29]/12 bg-white p-12 text-center text-[#8FA69E] font-medium shadow-xs">
          No matching tasks found for your selection.
        </div>
      ) : (
        tasks.map((t) => (
          <TaskCard key={t.id} task={t} onOpen={() => onOpenTask(t.id)} />
        ))
      )}
    </div>
  );
};
