import React, { useMemo, useState } from "react";
import {
  X,
  Plus,
  ChevronDown,
  Users,
  Tag,
  ListTodo,
  AlertCircle,
  Square,
} from "lucide-react";
import {
  type ITask,
  type IWorkspace,
  type IProject,
  type IBoard,
  type ISprint,
  type RefUser,
  type TaskPriority,
  PRIORITY_META,
  columnToStatus,
} from "@/types/task";
import { TaskAvatar } from "./TaskAvatar";

export interface CreateTaskModalProps {
  defaultColumn: string;
  workspaces: IWorkspace[];
  projects: IProject[];
  boards: IBoard[];
  sprints: ISprint[];
  users: RefUser[];
  currentMember: RefUser;
  onClose: () => void;
  onCreate: (task: ITask) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  defaultColumn,
  workspaces,
  projects,
  boards,
  sprints,
  users,
  currentMember,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");

  const availableProjects = useMemo(
    () => projects.filter((p) => p.workspace.id === workspaceId),
    [projects, workspaceId]
  );
  const [projectId, setProjectId] = useState(availableProjects[0]?.id ?? projects[0]?.id ?? "");

  const availableBoards = useMemo(
    () => boards.filter((b) => b.project.id === projectId),
    [boards, projectId]
  );
  const [boardId, setBoardId] = useState(availableBoards[0]?.id ?? boards[0]?.id ?? "");
  const activeBoard = boards.find((b) => b.id === boardId) ?? boards[0];

  const [column, setColumn] = useState(defaultColumn || activeBoard.columns[0]);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState(currentMember.id);
  const [watcherIds, setWatcherIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("6");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggleWatcher = (id: string) => {
    setWatcherIds((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const addTag = () => {
    const clean = tagDraft.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) setTags((prev) => [...prev, clean]);
    setTagDraft("");
  };

  const addSubtask = () => {
    const clean = subtaskDraft.trim();
    if (clean) setSubtasks((prev) => [...prev, clean]);
    setSubtaskDraft("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a task title.");
      return;
    }

    const selWs = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0];
    const selProj = projects.find((p) => p.id === projectId) ?? projects[0];
    const selBoard = boards.find((b) => b.id === boardId) ?? boards[0];
    const selAssignee = users.find((u) => u.id === assigneeId);

    const newTask: ITask = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      workspace: selWs,
      project: selProj,
      board: selBoard,
      sprint: sprints[0],
      column: column || selBoard.columns[0],
      status: columnToStatus[column] ?? "todo",
      priority,
      assignee: selAssignee,
      watchers: users.filter((u) => watcherIds.includes(u.id)),
      tags,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      estimatedHours: Number(estimatedHours) || 0,
      actualHours: 0,
      subtasks: subtasks.map((stTitle, i) => ({
        id: `st_${Date.now()}_${i}`,
        title: stTitle,
        completed: false,
      })),
      comments: [],
      attachments: [],
      isArchived: false,
      createdBy: currentMember,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreate(newTask);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden border border-[#0F2D29]/15 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#0F2D29]/10 px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-[#0F2D29] text-white">
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#0F2D29]">Create New Task</h2>
              <p className="text-[12px] font-medium text-[#5B6E68]">
                Add task to {activeBoard?.name || "board"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center text-[#8FA69E] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="create-task-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto px-6 py-5 sm:px-7"
        >
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
              Task Title *
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
              className="w-full border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-3 text-[13.5px] font-semibold text-[#0F2D29] outline-none transition placeholder:text-[#8FA69E] focus:border-[#0F2D29] focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
              Description & Acceptance Criteria
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description, requirements, or links..."
              rows={3}
              className="w-full resize-none border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-3 text-[13px] leading-relaxed text-[#0F2D29] outline-none transition placeholder:text-[#8FA69E] focus:border-[#0F2D29] focus:bg-white"
            />
          </div>

          {/* Workspace & Project Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
                Workspace
              </label>
              <div className="relative">
                <select
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  className="w-full appearance-none border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2.5 text-[12.5px] font-bold text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.icon} {ws.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
                Project
              </label>
              <div className="relative">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full appearance-none border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2.5 text-[12.5px] font-bold text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
                >
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
              </div>
            </div>
          </div>

          {/* Board & Column */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
                Board
              </label>
              <div className="relative">
                <select
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                  className="w-full appearance-none border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2.5 text-[12.5px] font-bold text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
                >
                  {availableBoards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
                Column
              </label>
              <div className="relative">
                <select
                  value={column}
                  onChange={(e) => setColumn(e.target.value)}
                  className="w-full appearance-none border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2.5 text-[12.5px] font-bold text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
                >
                  {(activeBoard?.columns || ["Backlog", "To Do", "In Progress", "Done"]).map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
              </div>
            </div>
          </div>

          {/* Priority & Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
                Priority
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full appearance-none border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2.5 text-[12.5px] font-bold text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
                >
                  {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_META[p].label} Priority
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
                Assignee
              </label>
              <div className="relative">
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full appearance-none border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2.5 text-[12.5px] font-bold text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
                >
                  {users.map((usr) => (
                    <option key={usr.id} value={usr.id}>
                      {usr.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA69E]" />
              </div>
            </div>
          </div>

          {/* Due Date & Estimated Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2.5 text-[12.5px] font-bold text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
                Estimated Hours
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2.5 text-[12.5px] font-bold text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
              />
            </div>
          </div>

          {/* Watchers */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
              <Users size={12} />
              Watchers
            </label>
            <div className="flex flex-wrap gap-1.5">
              {users.map((usr) => {
                const active = watcherIds.includes(usr.id);
                return (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => toggleWatcher(usr.id)}
                    className={`flex items-center gap-1.5 border px-2.5 py-1 text-[11.5px] font-semibold transition ${active
                      ? "border-[#0F2D29] bg-[#0F2D29]/10 text-[#0F2D29]"
                      : "border-[#0F2D29]/15 text-[#5B6E68] hover:bg-[#0F2D29]/5"
                      }`}
                  >
                    <TaskAvatar user={usr} size={18} />
                    {usr.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
              <Tag size={12} />
              Tags
            </label>
            <div className="flex items-center gap-2">
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type tag & press Enter"
                className="flex-1 border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2 text-[12.5px] font-semibold text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
              />
              <button
                type="button"
                onClick={addTag}
                className="border border-[#0F2D29]/15 px-3 py-2 text-[12px] font-bold text-[#0F2D29] hover:bg-[#0F2D29]/5"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-[#0F2D29]/6 text-[#0F2D29] border border-[#0F2D29]/10 px-2 py-0.5 text-[11px] font-semibold"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                      className="opacity-70 hover:opacity-100"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0F2D29]">
              <ListTodo size={12} />
              Subtasks
            </label>
            <div className="flex items-center gap-2">
              <input
                value={subtaskDraft}
                onChange={(e) => setSubtaskDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add subtask title..."
                className="flex-1 border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3.5 py-2 text-[12.5px] font-semibold text-[#0F2D29] outline-none focus:border-[#0F2D29] focus:bg-white"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="border border-[#0F2D29]/15 px-3 py-2 text-[12px] font-bold text-[#0F2D29] hover:bg-[#0F2D29]/5"
              >
                Add
              </button>
            </div>
            {subtasks.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {subtasks.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-[#0F2D29]/4 px-3 py-1.5 text-[12px] font-medium text-[#0F2D29]"
                  >
                    <span className="flex items-center gap-2">
                      <Square size={13} className="text-[#8FA69E]" />
                      {st}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSubtasks((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-[#8FA69E] hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-600">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#0F2D29]/10 px-6 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-[13px] font-semibold text-[#5B6E68] hover:bg-[#0F2D29]/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-task-form"
            className="flex items-center gap-2 bg-[#0F2D29] px-5 py-2.5 text-[13px] font-bold text-white shadow-xs hover:bg-[#081E1B]"
          >
            <Plus size={15} strokeWidth={2.5} />
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};
