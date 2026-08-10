import React, { useState } from "react";
import {
  X,
  FileText,
  ListTodo,
  MessageSquare,
  Paperclip,
  Timer,
  Calendar,
  Users,
  CheckSquare,
  Square,
  Send,
  Download,
  Trash2,
} from "lucide-react";
import {
  type ITask,
  type ISubTask,
  type IComment,
  type TaskStatus,
  STATUS_META,
  PRIMARY_COLOR,
  formatDate,
  getDaysRemaining,
  relativeTime,
  fileSizeFormatted,
} from "@/types/task";
import { TaskAvatar } from "./TaskAvatar";
import { PriorityBadge, StatusBadge } from "./TaskBadges";

export interface TaskDetailDrawerProps {
  task: ITask;
  currentMember: any;
  onClose: () => void;
  onUpdateTask: (updated: ITask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  currentMember,
  onClose,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "subtasks" | "comments" | "attachments" | "worklog"
  >("overview");
  const [commentText, setCommentText] = useState("");
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [loggedHours, setLoggedHours] = useState(task.actualHours.toString());

  const subtaskDone = task.subtasks.filter((s) => s.completed).length;
  const daysRemaining = getDaysRemaining(task.dueDate);
  const isOverdue =
    daysRemaining !== null && daysRemaining < 0 && task.status !== "completed";

  const handleToggleSubtask = (stId: string) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === stId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    const newSt: ISubTask = {
      id: `st_${Date.now()}`,
      title: newSubtaskText.trim(),
      completed: false,
    };
    onUpdateTask({
      ...task,
      subtasks: [...task.subtasks, newSt],
      updatedAt: new Date().toISOString(),
    });
    setNewSubtaskText("");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment: IComment = {
      id: `cm_${Date.now()}`,
      user: currentMember,
      message: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    onUpdateTask({
      ...task,
      comments: [newComment, ...task.comments],
      updatedAt: new Date().toISOString(),
    });
    setCommentText("");
  };

  const handleAddWorklog = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(loggedHours);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateTask({
        ...task,
        actualHours: parsed,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0F2D29]/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200 sm:max-w-xl">
        {/* Header */}
        <div className="border-b border-[#0F2D29]/10 px-6 py-5 sm:px-7">
          {/* Breadcrumb */}
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[#5B6E68]">
            <span>{task.workspace.name}</span>
            <span>/</span>
            <span className="text-[#0F2D29]">{task.project.name}</span>
            <span>/</span>
            <span className="text-[#8FA69E]">{task.board.name}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6E68] bg-[#0F2D29]/5 px-2 py-0.5 border border-[#0F2D29]/10">
                  Column: {task.column}
                </span>
              </div>
              <h2 className="mt-3 text-[20px] font-bold font-['Goldman',sans-serif] leading-snug tracking-[-0.01em] text-[#0F2D29]">
                {task.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#0F2D29]/10 text-[#8FA69E] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs (Zero native scrollbar, whitespace-nowrap, crisp count pills) */}
          <div className="mt-5 flex gap-1 border-b border-[#0F2D29]/10 pt-1 overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "Overview", icon: FileText },
              { id: "subtasks", label: "Subtasks", count: task.subtasks.length, icon: ListTodo },
              { id: "comments", label: "Comments", count: task.comments.length, icon: MessageSquare },
              { id: "attachments", label: "Files", count: task.attachments.length, icon: Paperclip },
              { id: "worklog", label: "Work Log", icon: Timer },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-[12.5px] font-bold transition-all whitespace-nowrap ${
                    isSel
                      ? "border-[#0F2D29] text-[#0F2D29] bg-[#0F2D29]/5"
                      : "border-transparent text-[#5B6E68] hover:text-[#0F2D29] hover:bg-[#0F2D29]/3"
                  }`}
                >
                  <Icon size={14} className={isSel ? "text-[#0F2D29]" : "text-[#8FA69E]"} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 text-[10.5px] font-extrabold ${
                        isSel ? "bg-[#0F2D29] text-white" : "bg-[#0F2D29]/10 text-[#0F2D29]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-7">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">
                  Description
                </h4>
                <p className="text-[13px] leading-relaxed text-[#0F2D29] bg-[#0F2D29]/3 p-3.5 border border-[#0F2D29]/8">
                  {task.description || "No description provided."}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#0F2D29]/8 bg-[#0F2D29]/3 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B6E68]">Workspace</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-bold text-[#0F2D29]">
                    <span>{task.workspace.icon}</span> {task.workspace.name}
                  </p>
                </div>

                <div className="border border-[#0F2D29]/8 bg-[#0F2D29]/3 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B6E68]">Project</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-bold text-[#0F2D29]">
                    <span className="h-2.5 w-2.5 bg-[#0F2D29]" />
                    {task.project.name}
                  </p>
                </div>

                <div className="border border-[#0F2D29]/8 bg-[#0F2D29]/3 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B6E68]">Board & Type</p>
                  <p className="mt-1 text-[12.5px] font-bold text-[#0F2D29]">
                    {task.board.name} ({task.board.type.toUpperCase()})
                  </p>
                </div>

                <div className="border border-[#0F2D29]/8 bg-[#0F2D29]/3 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B6E68]">Priority</p>
                  <div className="mt-1">
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>

                <div className="border border-[#0F2D29]/8 bg-[#0F2D29]/3 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B6E68]">Assignee</p>
                  <div className="mt-1 flex items-center gap-2">
                    {task.assignee ? (
                      <>
                        <TaskAvatar user={task.assignee} size={22} />
                        <span className="truncate text-[12.5px] font-bold text-[#0F2D29]">
                          {task.assignee.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-[12px] font-semibold text-[#8FA69E]">Unassigned</span>
                    )}
                  </div>
                </div>

                <div className="border border-[#0F2D29]/8 bg-[#0F2D29]/3 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B6E68]">Due Date</p>
                  <p className={`mt-1 flex items-center gap-1 text-[12.5px] font-bold ${isOverdue ? "text-red-600" : "text-[#0F2D29]"}`}>
                    <Calendar size={13} />
                    {formatDate(task.dueDate) || "No due date"}
                  </p>
                </div>
              </div>

              {/* Watchers */}
              {task.watchers.length > 0 && (
                <div>
                  <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">
                    <Users size={12} /> Watchers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {task.watchers.map((w) => (
                      <div key={w.id} className="flex items-center gap-1.5 border border-[#0F2D29]/10 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-[#0F2D29]">
                        <TaskAvatar user={w} size={18} />
                        {w.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Status Change Buttons */}
              <div>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">
                  Update Task Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUS_META) as TaskStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() =>
                        onUpdateTask({
                          ...task,
                          status: st,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className={`px-3 py-1.5 text-[11.5px] font-bold transition ${
                        task.status === st
                          ? "bg-[#0F2D29] text-white"
                          : "border border-[#0F2D29]/15 text-[#5B6E68] hover:bg-[#0F2D29]/5"
                      }`}
                    >
                      {STATUS_META[st].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "subtasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#5B6E68]">
                  Checklist ({subtaskDone}/{task.subtasks.length} Completed)
                </h4>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden bg-[#0F2D29]/10">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: task.subtasks.length > 0 ? `${(subtaskDone / task.subtasks.length) * 100}%` : "0%",
                    backgroundColor: PRIMARY_COLOR,
                  }}
                />
              </div>

              {/* List */}
              <div className="space-y-2">
                {task.subtasks.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleToggleSubtask(st.id)}
                    className="flex w-full items-center gap-3 border border-[#0F2D29]/8 bg-white p-3 text-left transition hover:border-[#0F2D29]/30 hover:bg-[#0F2D29]/3"
                  >
                    {st.completed ? (
                      <CheckSquare size={18} className="shrink-0 text-[#0F2D29]" />
                    ) : (
                      <Square size={18} className="shrink-0 text-[#8FA69E]" />
                    )}
                    <span className={`text-[13px] font-semibold ${st.completed ? "line-through text-[#8FA69E]" : "text-[#0F2D29]"}`}>
                      {st.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Add subtask */}
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-2">
                <input
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Add a new subtask..."
                  className="flex-1 border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2 text-[12.5px] font-semibold text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
                />
                <button
                  type="submit"
                  className="bg-[#0F2D29] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#081E1B]"
                >
                  Add
                </button>
              </form>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              {/* Post comment */}
              <form onSubmit={handleAddComment} className="space-y-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment or status update..."
                  rows={2}
                  className="w-full resize-none border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2.5 text-[12.5px] text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-[#0F2D29] px-4 py-2 text-[12px] font-bold text-white shadow-2xs hover:bg-[#081E1B]"
                  >
                    <Send size={12} /> Post Comment
                  </button>
                </div>
              </form>

              {/* Comments list */}
              <div className="space-y-3 pt-2">
                {task.comments.length === 0 ? (
                  <p className="text-center text-[12px] text-[#8FA69E]">No comments yet. Start the conversation!</p>
                ) : (
                  task.comments.map((c) => (
                    <div key={c.id} className="border border-[#0F2D29]/8 bg-[#0F2D29]/3 p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <TaskAvatar user={c.user} size={22} />
                          <span className="text-[12.5px] font-bold text-[#0F2D29]">{c.user.name}</span>
                        </div>
                        <span className="text-[10.5px] text-[#8FA69E]">{relativeTime(c.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-[#5B6E68]">{c.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#5B6E68]">Files & Mockups</h4>
              </div>

              <div className="space-y-2">
                {task.attachments.length === 0 ? (
                  <p className="text-center text-[12px] text-[#8FA69E]">No attachments uploaded yet.</p>
                ) : (
                  task.attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between gap-3 border border-[#0F2D29]/10 bg-white p-3 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center bg-[#0F2D29]/10 text-[#0F2D29]">
                          <Paperclip size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-[#0F2D29]">{att.fileName}</p>
                          <p className="text-[11px] text-[#8FA69E]">{fileSizeFormatted(att.fileSize)} · uploaded by {att.uploadedBy.name}</p>
                        </div>
                      </div>
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-8 w-8 items-center justify-center text-[#0F2D29] hover:bg-[#0F2D29]/10"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "worklog" && (
            <div className="space-y-4">
              <div className="border border-[#0F2D29]/10 bg-[#0F2D29]/3 p-4 space-y-3">
                <h4 className="text-[13px] font-bold text-[#0F2D29]">Time Tracking Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-[#5B6E68]">Estimated Hours</p>
                    <p className="text-[16px] font-bold text-[#0F2D29]">{task.estimatedHours} hrs</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#5B6E68]">Logged Actual Hours</p>
                    <p className="text-[16px] font-bold text-[#0F2D29]">{task.actualHours} hrs</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddWorklog} className="space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
                  Log Additional Work Hours
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={loggedHours}
                    onChange={(e) => setLoggedHours(e.target.value)}
                    className="flex-1 border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2 text-[13px] font-bold text-[#0F2D29]"
                  />
                  <button
                    type="submit"
                    className="bg-[#0F2D29] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#081E1B]"
                  >
                    Save Hours
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#0F2D29]/10 px-6 py-4 sm:px-7">
          <button
            onClick={() => {
              onDeleteTask(task.id);
              onClose();
            }}
            className="flex items-center gap-1.5 text-[12px] font-bold text-red-600 hover:text-red-700"
          >
            <Trash2 size={14} /> Delete Task
          </button>

          <button
            onClick={onClose}
            className="border border-[#0F2D29]/15 px-4 py-2 text-[12.5px] font-bold text-[#0F2D29] hover:bg-[#0F2D29]/5"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
