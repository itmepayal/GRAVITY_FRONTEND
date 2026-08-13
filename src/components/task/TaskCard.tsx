import React from "react";
import {
  FolderKanban,
  Ban,
  GripVertical,
  ListTodo,
  MessageSquare,
  Paperclip,
  Timer,
  Clock,
} from "lucide-react";
import { type ITask, PRIMARY_COLOR, getDaysRemaining } from "@/types/task";
import { TaskAvatar } from "./TaskAvatar";
import { PriorityBadge } from "./TaskBadges";

export interface TaskCardProps {
  task: ITask;
  onOpen: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onOpen,
  onDragStart,
  isDragging,
}) => {
  const daysRemaining = getDaysRemaining(task.dueDate);
  const isBlocked = task.status === "blocked";
  const isOverdue =
    daysRemaining !== null && daysRemaining < 0 && task.status !== "completed";
  const subtaskDone = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const subtaskTotal = task.subtasks?.length ?? 0;

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onClick={onOpen}
      className={`group cursor-pointer flex flex-col justify-between min-h-[140px] rounded-xl border bg-white p-3.5 sm:p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isDragging ? "opacity-40 scale-[0.98] ring-2 ring-[#0F2D29]" : "opacity-100"
      } ${
        isBlocked
          ? "border-red-200 bg-red-50/20 hover:border-red-400"
          : "border-[#0F2D29]/12 hover:border-[#0F2D29]/40"
      }`}
      style={{
        borderLeft: `4px solid ${isBlocked ? "#DC2626" : PRIMARY_COLOR}`,
      }}
    >
      <div>
        {/* Card Header: Project tag & priority */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {task.project?.name && (
              <span className="truncate max-w-[130px] flex items-center gap-1.5 rounded-md bg-[#0F2D29]/6 text-[#0F2D29] border border-[#0F2D29]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                <FolderKanban size={11} className="shrink-0 text-[#0F2D29]/70" />
                <span className="truncate">{task.project.name}</span>
              </span>
            )}
            <PriorityBadge priority={task.priority} />
            {isBlocked && (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700 border border-red-200">
                <Ban size={10} strokeWidth={2.5} />
                Blocked
              </span>
            )}
          </div>
          <GripVertical
            size={14}
            className="shrink-0 text-[#8FA69E]/0 transition-opacity group-hover:text-[#8FA69E]"
          />
        </div>

        {/* Task Title */}
        <h3 className="mt-2.5 text-[13.5px] sm:text-[14px] font-bold leading-snug tracking-tight text-[#0F2D29] transition-colors group-hover:text-[#1E4D45] line-clamp-2 break-words">
          {task.title}
        </h3>

        {/* Optional Description Preview */}
        {task.description && (
          <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-[#5B6E68] line-clamp-2 break-words">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-[#0F2D29]/5 text-[#0F2D29] border border-[#0F2D29]/10 px-2 py-0.5 text-[10px] font-semibold tracking-tight"
              >
                #{tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="rounded-md bg-[#0F2D29]/5 text-[#5B6E68] border border-[#0F2D29]/10 px-1.5 py-0.5 text-[9.5px] font-bold">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Subtasks Progress bar */}
        {subtaskTotal > 0 && (
          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#5B6E68]">
              <span className="flex items-center gap-1">
                <ListTodo size={11} />
                Subtasks
              </span>
              <span className="text-[#0F2D29]">
                {subtaskDone}/{subtaskTotal}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0F2D29]/8">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(subtaskDone / subtaskTotal) * 100}%`,
                  backgroundColor: PRIMARY_COLOR,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Metadata & Assignee/Watchers Stack */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#0F2D29]/8 pt-2.5">
        {/* Left Metadata Icons */}
        <div className="flex flex-wrap items-center gap-2.5 text-[#5B6E68]">
          {task.comments && task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0F2D29]">
              <MessageSquare size={12} className="text-[#0F2D29]/80" />
              {task.comments.length}
            </span>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0F2D29]">
              <Paperclip size={12} className="text-[#0F2D29]/80" />
              {task.attachments.length}
            </span>
          )}
          {task.estimatedHours > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#5B6E68]">
              <Timer size={12} />
              {task.actualHours}/{task.estimatedHours}h
            </span>
          )}
          {daysRemaining !== null && task.status !== "completed" && (
            <span
              className={`flex items-center gap-1 text-[10.5px] font-bold ${
                isOverdue
                  ? "text-red-600 font-bold"
                  : daysRemaining <= 2
                  ? "text-amber-600"
                  : "text-[#5B6E68]"
              }`}
            >
              <Clock size={11} />
              {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
            </span>
          )}
        </div>

        {/* Right Assignee & Watchers Stack */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {task.assignee ? (
            <div
              className="flex items-center gap-1.5 rounded-full bg-[#0F2D29]/6 pl-0.5 pr-2.5 py-0.5 border border-[#0F2D29]/15 text-[10.5px] font-bold text-[#0F2D29]"
              title={
                task.assignee.email
                  ? `Assignee: ${task.assignee.name || "User"} (${task.assignee.email})`
                  : `Assignee: ${task.assignee.name || "User"}`
              }
            >
              <TaskAvatar user={task.assignee} size={18} />
              <span className="truncate max-w-[70px] leading-none">
                {(task.assignee.name || task.assignee.email || "User").split(" ")[0]}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-semibold text-[#8FA69E] bg-[#0F2D29]/4 rounded-full px-2 py-0.5 border border-[#0F2D29]/10">
              Unassigned
            </span>
          )}

          {task.watchers && task.watchers.length > 0 && (
            <div className="flex items-center -space-x-1" title={`${task.watchers.length} watchers`}>
              {task.watchers.slice(0, 2).map((w, idx) => (
                <TaskAvatar key={w.id || (typeof w === "object" ? (w as any)._id : String(w)) || idx} user={w} size={18} />
              ))}
              {task.watchers.length > 2 && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#0F2D29] text-[9px] font-bold text-white ring-1 ring-white">
                  +{task.watchers.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
