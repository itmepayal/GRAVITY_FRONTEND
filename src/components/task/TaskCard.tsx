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
  const subtaskDone = task.subtasks.filter((s) => s.completed).length;
  const subtaskTotal = task.subtasks.length;

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onClick={onOpen}
      className={`group cursor-pointer border bg-white p-4 shadow-[0_2px_8px_rgba(15,45,41,0.04)] transition-all duration-150 hover:shadow-md ${
        isDragging ? "opacity-30" : "opacity-100"
      } ${
        isBlocked
          ? "border-red-300 bg-red-50/20"
          : "border-[#0F2D29]/12 hover:border-[#0F2D29]"
      }`}
      style={{
        borderLeft: `4px solid ${isBlocked ? "#DC2626" : PRIMARY_COLOR}`,
      }}
    >
      {/* Card Header: Project tag & priority */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 bg-[#0F2D29]/8 text-[#0F2D29] border border-[#0F2D29]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <FolderKanban size={10} />
            {task.project.name}
          </span>
          <PriorityBadge priority={task.priority} />
          {isBlocked && (
            <span className="inline-flex items-center gap-1 bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
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
      <h3 className="mt-3 text-[14px] font-bold leading-snug tracking-[-0.01em] text-[#0F2D29] transition-colors group-hover:text-[#0F2D29]">
        {task.title}
      </h3>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#0F2D29]/6 text-[#0F2D29] border border-[#0F2D29]/10 px-2 py-0.5 text-[10.5px] font-semibold"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks Progress bar */}
      {subtaskTotal > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10.5px] font-bold uppercase tracking-wider text-[#5B6E68]">
            <span className="flex items-center gap-1">
              <ListTodo size={11} />
              Subtasks
            </span>
            <span className="text-[#0F2D29]">
              {subtaskDone}/{subtaskTotal}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden bg-[#0F2D29]/8">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${(subtaskDone / subtaskTotal) * 100}%`,
                backgroundColor: PRIMARY_COLOR,
              }}
            />
          </div>
        </div>
      )}

      {/* Card Footer: Metadata & Assignee/Watchers Stack */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#0F2D29]/8 pt-2.5">
        {/* Left Metadata Icons */}
        <div className="flex flex-wrap items-center gap-2.5 text-[#5B6E68]">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0F2D29]">
              <MessageSquare size={12} className="text-[#0F2D29]" />
              {task.comments.length}
            </span>
          )}
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0F2D29]">
              <Paperclip size={12} className="text-[#0F2D29]" />
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
              className={`flex items-center gap-1 text-[11px] font-bold ${
                isOverdue
                  ? "text-red-600 font-bold"
                  : daysRemaining <= 2
                  ? "text-amber-600"
                  : "text-[#5B6E68]"
              }`}
            >
              <Clock size={12} />
              {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
            </span>
          )}
        </div>

        {/* Right Assignee & Watchers Stack */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {task.assignee ? (
            <div
              className="flex items-center gap-1 bg-[#0F2D29]/5 pl-1 pr-2 py-0.5 border border-[#0F2D29]/15 text-[11px] font-bold text-[#0F2D29]"
              title={`Assignee: ${task.assignee.name} (${task.assignee.email})`}
            >
              <TaskAvatar user={task.assignee} size={18} />
              <span className="truncate max-w-[65px] leading-none">{task.assignee.name.split(" ")[0]}</span>
            </div>
          ) : (
            <span className="text-[10px] font-semibold text-[#8FA69E] bg-[#0F2D29]/4 px-1.5 py-0.5 border border-[#0F2D29]/10">
              Unassigned
            </span>
          )}

          {task.watchers.length > 0 && (
            <div className="flex items-center gap-1" title={`${task.watchers.length} watchers`}>
              {task.watchers.slice(0, 2).map((w) => (
                <TaskAvatar key={w.id} user={w} size={18} />
              ))}
              {task.watchers.length > 2 && (
                <span className="flex h-4.5 w-4.5 items-center justify-center bg-[#0F2D29] text-[9px] font-bold text-white">
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
