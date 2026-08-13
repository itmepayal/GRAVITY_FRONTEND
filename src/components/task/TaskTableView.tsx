import React from "react";
import { type ITask, formatDate } from "@/types/task";
import { TaskAvatar } from "./TaskAvatar";
import { StatusBadge, PriorityBadge } from "./TaskBadges";

export interface TaskTableViewProps {
  tasks: ITask[];
  onOpenTask: (taskId: string) => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({ tasks, onOpenTask }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#0F2D29]/12 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] text-[#0F2D29]">
          <thead className="border-b border-[#0F2D29]/10 bg-[#0F2D29]/4 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">
            <tr>
              <th className="px-5 py-3.5">Task Title</th>
              <th className="px-4 py-3.5">Project / Board</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Priority</th>
              <th className="px-4 py-3.5">Assignee</th>
              <th className="px-4 py-3.5">Subtasks</th>
              <th className="px-4 py-3.5">Hours Logged</th>
              <th className="px-4 py-3.5">Due Date</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0F2D29]/8">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-10 text-center text-[#8FA69E] font-medium">
                  No matching tasks found.
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => onOpenTask(t.id)}
                  className="cursor-pointer transition-colors duration-150 hover:bg-[#0F2D29]/4"
                >
                  <td className="px-5 py-4 font-bold text-[#0F2D29]">
                    <div className="flex flex-col">
                      <span className="hover:text-[#1E4D45] transition-colors">{t.title}</span>
                      {t.tags && t.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {t.tags.map((tg) => (
                            <span key={tg} className="rounded-md bg-[#0F2D29]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#0F2D29]">#{tg}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#0F2D29]">
                    <div className="flex flex-col">
                      <span className="font-semibold">{t.project?.name || "—"}</span>
                      <span className="text-[11px] text-[#5B6E68]">{t.board?.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-4">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-4 py-4">
                    {t.assignee ? (
                      <div className="flex items-center gap-2">
                        <TaskAvatar user={t.assignee} size={22} />
                        <span className="font-semibold text-[#0F2D29]">{(t.assignee.name || t.assignee.email || "User").split(" ")[0]}</span>
                      </div>
                    ) : (
                      <span className="text-[#8FA69E] text-[12px] font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#5B6E68]">
                    {t.subtasks?.filter((s) => s.completed).length ?? 0} / {t.subtasks?.length ?? 0}
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#5B6E68]">
                    {t.actualHours || 0}h / {t.estimatedHours || 0}h
                  </td>
                  <td className="px-4 py-4 font-medium text-[#5B6E68]">
                    {formatDate(t.dueDate) || "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTask(t.id);
                      }}
                      className="rounded-lg border border-[#0F2D29]/15 bg-white px-3 py-1.5 text-[11.5px] font-bold text-[#0F2D29] transition-all hover:bg-[#0F2D29] hover:text-white hover:border-[#0F2D29] shadow-2xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
