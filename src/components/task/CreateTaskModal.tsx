import { useState, type FormEvent } from "react";
import {
  X,
  Plus,
  Loader2,
  Flag,
  CalendarDays,
  Tag as TagIcon,
  UserCircle2,
  Users,
  Zap,
  ListTodo,
  Check,
  Briefcase,
  FolderKanban,
  ListChecks,
  Trash2,
  Activity,
} from "lucide-react";
import {
  INK,
  TEAL,
  MINT,
  PRIORITY_META,
  PRIORITY_ORDER,
  TAG_COLORS,
  ALL_TAGS,
  inputClass,
  type Priority,
  type TagName,
  type BoardType,
} from "@/pages/dashboard/board/type";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";

// --- schema-accurate status enum (matches ITask["status"]) ---
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "in_review"
  | "testing"
  | "completed"
  | "blocked";

export const STATUS_META: Record<
  TaskStatus,
  { label: string; color: string; bg: string }
> = {
  todo: { label: "To Do", color: "#5B6E68", bg: "#EDEBE3" },
  in_progress: { label: "In Progress", color: "#0F8A65", bg: "#E7F5EF" },
  in_review: { label: "In Review", color: "#B45309", bg: "#FEF3E2" },
  testing: { label: "Testing", color: "#6D28D9", bg: "#F1EAFE" },
  completed: { label: "Completed", color: "#2563EB", bg: "#EAF1FE" },
  blocked: { label: "Blocked", color: "#B3261E", bg: "#FBEAE9" },
};

export const STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "testing",
  "completed",
  "blocked",
];

// --- subtask draft used only inside the modal before submit ---
export interface NewSubTaskInput {
  title: string;
  completed: boolean;
}

// --- mirrors ITask fields the client is allowed to set on create ---
export interface NewTaskInput {
  title: string;
  description?: string;

  board: string;
  project: string;
  workspace: string;
  sprint?: string;

  column: string;

  assignee?: string; // user id
  watchers: string[]; // user ids

  status: TaskStatus;
  priority: Priority;

  tags: TagName[];

  dueDate: string | null;

  estimatedHours?: number;
  actualHours?: number;

  subtasks: NewSubTaskInput[];

  isArchived: boolean;

  // display-only, not part of schema, kept for the UI avatar badge
  assigneeLabel: string;
}

interface CreateTaskModalProps {
  columns: string[];
  defaultColumn: string;
  boardType: BoardType;
  boardId: string;
  onClose: () => void;
  onCreated: (task: NewTaskInput) => void;
  isSubmitting?: boolean;
}

function unwrapList<T>(res: any): T[] {
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res?.data)) return res.data as T[];
  return [];
}

// Column name -> default status, so switching column pre-fills a sensible
// workflow state without forcing the user to set both manually every time.
function defaultStatusForColumn(column: string): TaskStatus {
  const key = column.trim().toLowerCase();
  if (key.includes("progress")) return "in_progress";
  if (key.includes("review")) return "in_review";
  if (key.includes("test") || key.includes("qa")) return "testing";
  if (key.includes("done") || key.includes("complete")) return "completed";
  if (key.includes("block")) return "blocked";
  return "todo";
}

export const CreateTaskModal = ({
  columns,
  defaultColumn,
  boardType,
  boardId,
  onClose,
  onCreated,
  isSubmitting = false,
}: CreateTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [column, setColumn] = useState(defaultColumn || columns[0] || "");
  const [status, setStatus] = useState<TaskStatus>(
    defaultStatusForColumn(defaultColumn || columns[0] || ""),
  );
  const [priority, setPriority] = useState<Priority>("medium");
  const [tags, setTags] = useState<TagName[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<string>("");
  const [actualHours, setActualHours] = useState<string>("");

  // workspace -> project cascading select
  const [workspaceId, setWorkspaceId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [sprintId, setSprintId] = useState("");

  // assignee + watchers (multi)
  const [assigneeId, setAssigneeId] = useState("");
  const [watcherIds, setWatcherIds] = useState<string[]>([]);

  // subtasks
  const [subtasks, setSubtasks] = useState<NewSubTaskInput[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState("");

  const { data: workspacesRes, isLoading: isLoadingWorkspaces } =
    useGetUserWorkspaces();
  const { data: projectsRes, isLoading: isLoadingProjects } =
    useGetWorkspaceProjects(workspaceId);
  const { data: usersRes, isLoading: isLoadingUsers } = useGetAllUsers();

  const workspaceOptions = unwrapList<any>(workspacesRes).map((ws) => ({
    id: ws._id ?? ws.id,
    name: ws.name,
  }));

  const projectOptions = unwrapList<any>(projectsRes).map((p) => ({
    id: p._id ?? p.id,
    name: p.name,
  }));

  const userOptions = unwrapList<any>(usersRes).map((u) => ({
    id: u._id ?? u.id,
    name: u.name ?? u.fullName ?? u.email ?? "Unknown",
  }));

  const selectedUser = userOptions.find((u) => u.id === assigneeId);

  const handleWorkspaceChange = (id: string) => {
    setWorkspaceId(id);
    setProjectId("");
    setSprintId("");
  };

  const handleColumnChange = (col: string) => {
    setColumn(col);
    setStatus(defaultStatusForColumn(col));
  };

  const toggleWatcher = (id: string) => {
    setWatcherIds((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
    );
  };

  const accent = boardType === "scrum" ? TEAL : INK;
  const accentSoft = boardType === "scrum" ? "#E7F5EF" : "#EDEBE3";

  const toggleTag = (tag: TagName) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const addSubtask = () => {
    const t = subtaskDraft.trim();
    if (!t) return;
    setSubtasks((prev) => [...prev, { title: t, completed: false }]);
    setSubtaskDraft("");
  };

  const removeSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSubtaskDone = (index: number) => {
    setSubtasks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s)),
    );
  };

  const isValid =
    title.trim().length >= 2 && !!column && !!projectId && !!workspaceId;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    onCreated({
      title: title.trim(),
      description: description.trim() || undefined,

      board: boardId,
      project: projectId,
      workspace: workspaceId,
      sprint: sprintId || undefined,

      column,

      assignee: assigneeId || undefined,
      watchers: watcherIds,

      status,
      priority,
      tags,

      dueDate: dueDate || null,

      estimatedHours:
        boardType === "scrum" && estimatedHours
          ? Number(estimatedHours)
          : undefined,
      actualHours: actualHours ? Number(actualHours) : undefined,

      subtasks,

      isArchived: false,

      assigneeLabel: selectedUser
        ? selectedUser.name.trim().slice(0, 3).toUpperCase()
        : "—",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 p-4 backdrop-blur-sm"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden border border-[#0F2D29] bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0F2D29] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center shadow-sm"
                style={{ backgroundColor: accent }}
              >
                {boardType === "scrum" ? (
                  <Zap size={18} className="text-white" />
                ) : (
                  <ListTodo size={18} className="text-white" />
                )}
              </div>
              <div>
                <h2 className="text-[17px] font-bold font-['Goldman',sans-serif] text-white">
                  Create New Task
                </h2>
                <p className="text-[12px] text-[#B7CFC7]">
                  Add a task to "{column || defaultColumn}".
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex h-8 w-8 items-center justify-center text-[#B7CFC7] transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <fieldset disabled={isSubmitting} className="disabled:opacity-70">
          <form
            onSubmit={submit}
            className="max-h-[75vh] space-y-4 overflow-y-auto p-6"
          >
            <div>
              <label
                htmlFor="task-title"
                className="mb-1.5 block text-[12px] font-semibold text-[#0F2D29]"
              >
                Task Title *
              </label>
              <input
                id="task-title"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design the onboarding flow"
                minLength={2}
                maxLength={140}
                required
                className={inputClass}
              />
              {title && title.trim().length < 2 && (
                <p className="mt-1 text-[11px] text-red-500">
                  Task title must be at least 2 characters.
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="task-desc"
                  className="text-[12px] font-semibold text-[#0F2D29]"
                >
                  Description{" "}
                  <span className="font-normal text-[#8FA69E]">(optional)</span>
                </label>
                <span className="text-[10.5px] text-[#8FA69E]">
                  {description.length}/500
                </span>
              </div>
              <textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="What needs to get done?"
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* --- Workspace / Project cascading selects --- */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="task-workspace"
                  className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]"
                >
                  <Briefcase size={13} className="text-[#0F8A65]" />
                  Workspace *
                </label>
                <select
                  id="task-workspace"
                  value={workspaceId}
                  onChange={(e) => handleWorkspaceChange(e.target.value)}
                  disabled={isLoadingWorkspaces}
                  required
                  className={inputClass}
                >
                  <option value="">
                    {isLoadingWorkspaces ? "Loading..." : "Select workspace"}
                  </option>
                  {workspaceOptions.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-project"
                  className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]"
                >
                  <FolderKanban size={13} className="text-[#0F8A65]" />
                  Project *
                </label>
                <select
                  id="task-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  disabled={!workspaceId || isLoadingProjects}
                  required
                  className={inputClass}
                >
                  <option value="">
                    {!workspaceId
                      ? "Select workspace first"
                      : isLoadingProjects
                        ? "Loading..."
                        : "Select project"}
                  </option>
                  {projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* --- Column / Status --- */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="task-column"
                  className="mb-1.5 block text-[12px] font-semibold text-[#0F2D29]"
                >
                  Column
                </label>
                <select
                  id="task-column"
                  value={column}
                  onChange={(e) => handleColumnChange(e.target.value)}
                  className={inputClass}
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-status"
                  className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]"
                >
                  <Activity size={13} className="text-[#0F8A65]" />
                  Status
                </label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className={inputClass}
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* --- Assignee / Sprint --- */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="task-assignee"
                  className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]"
                >
                  <UserCircle2 size={13} className="text-[#0F8A65]" />
                  Assignee
                </label>
                <select
                  id="task-assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  disabled={isLoadingUsers}
                  className={inputClass}
                >
                  <option value="">
                    {isLoadingUsers ? "Loading..." : "Unassigned"}
                  </option>
                  {userOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-sprint"
                  className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]"
                >
                  <Zap size={13} className="text-[#0F8A65]" />
                  Sprint{" "}
                  <span className="font-normal text-[#8FA69E]">(optional)</span>
                </label>
                <input
                  id="task-sprint"
                  value={sprintId}
                  onChange={(e) => setSprintId(e.target.value)}
                  placeholder="Sprint ID"
                  className={inputClass}
                />
                {/* Swap this input for a <select> once a
                    useGetProjectSprints(projectId) hook is available. */}
              </div>
            </div>

            {/* --- Watchers (multi-select via toggle chips) --- */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]">
                <Users size={13} className="text-[#0F8A65]" />
                Watchers{" "}
                <span className="font-normal text-[#8FA69E]">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {isLoadingUsers && (
                  <span className="text-[11px] text-[#8FA69E]">
                    Loading users...
                  </span>
                )}
                {userOptions.map((u) => {
                  const active = watcherIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleWatcher(u.id)}
                      className="flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-semibold transition"
                      style={{
                        borderColor: active ? TEAL : `${INK}22`,
                        backgroundColor: active ? "#E7F5EF" : "white",
                        color: active ? TEAL : `${INK}99`,
                      }}
                    >
                      {active && <Check size={11} />}
                      {u.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]">
                <Flag size={13} className="text-[#0F8A65]" />
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_ORDER.map((p) => {
                  const meta = PRIORITY_META[p];
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className="flex items-center gap-1.5 border px-3 py-1.5 text-[11px] font-bold transition"
                      style={{
                        borderColor: active ? meta.color : `${INK}22`,
                        backgroundColor: active ? meta.bg : "white",
                        color: active ? meta.color : `${INK}99`,
                      }}
                    >
                      {active && <Check size={11} />}
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]">
                <TagIcon size={13} className="text-[#0F8A65]" />
                Tags{" "}
                <span className="font-normal text-[#8FA69E]">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => {
                  const meta = TAG_COLORS[tag];
                  const active = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition"
                      style={{
                        color: active ? meta.color : `${INK}66`,
                        backgroundColor: active ? meta.bg : "#EDEBE3",
                        outline: active
                          ? `1.5px solid ${meta.color}55`
                          : "none",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- Due date / hours --- */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="task-due"
                  className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]"
                >
                  <CalendarDays size={13} className="text-[#0F8A65]" />
                  Due date{" "}
                  <span className="font-normal text-[#8FA69E]">(optional)</span>
                </label>
                <input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              {boardType === "scrum" && (
                <div>
                  <label
                    htmlFor="task-est-hours"
                    className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]"
                  >
                    <Zap size={13} className="text-[#0F8A65]" />
                    Est. hours
                  </label>
                  <input
                    id="task-est-hours"
                    type="number"
                    min={0}
                    max={1000}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="e.g. 8"
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="task-actual-hours"
                  className="mb-1.5 block text-[12px] font-semibold text-[#0F2D29]"
                >
                  Actual hours{" "}
                  <span className="font-normal text-[#8FA69E]">(optional)</span>
                </label>
                <input
                  id="task-actual-hours"
                  type="number"
                  min={0}
                  max={1000}
                  value={actualHours}
                  onChange={(e) => setActualHours(e.target.value)}
                  placeholder="e.g. 0"
                  className={inputClass}
                />
              </div>
            </div>

            {/* --- Subtasks --- */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]">
                <ListChecks size={13} className="text-[#0F8A65]" />
                Subtasks{" "}
                <span className="font-normal text-[#8FA69E]">(optional)</span>
              </label>

              <div className="flex gap-2">
                <input
                  value={subtaskDraft}
                  onChange={(e) => setSubtaskDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                  placeholder="Add a subtask and press Enter"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  className="flex shrink-0 items-center justify-center border px-3 text-[#0F2D29]"
                  style={{ borderColor: `${INK}22` }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {subtasks.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {subtasks.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between border px-2.5 py-1.5 text-[11px]"
                      style={{ borderColor: `${INK}15` }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSubtaskDone(i)}
                        className="flex items-center gap-2 text-left"
                        style={{
                          color: s.completed ? "#0F8A65" : INK,
                          textDecoration: s.completed ? "line-through" : "none",
                        }}
                      >
                        <span
                          className="flex h-4 w-4 items-center justify-center border"
                          style={{
                            borderColor: s.completed ? "#0F8A65" : `${INK}44`,
                            backgroundColor: s.completed ? "#E7F5EF" : "white",
                          }}
                        >
                          {s.completed && <Check size={10} color="#0F8A65" />}
                        </span>
                        {s.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubtask(i)}
                        style={{ color: "#B3261E" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              className="flex items-center gap-2.5 border p-3"
              style={{ borderColor: `${INK}12`, backgroundColor: accentSoft }}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center text-[9px] font-bold"
                style={{ backgroundColor: MINT, color: INK }}
              >
                {selectedUser
                  ? selectedUser.name.trim().slice(0, 3).toUpperCase()
                  : "—"}
              </div>
              <p
                className="text-[11px] font-medium"
                style={{ color: `${INK}99` }}
              >
                This task will be added to{" "}
                <span className="font-bold" style={{ color: accent }}>
                  {column || defaultColumn}
                </span>{" "}
                as{" "}
                <span className="font-bold" style={{ color: accent }}>
                  {STATUS_META[status].label}
                </span>
                {selectedUser && (
                  <>
                    {" "}
                    · assigned to{" "}
                    <span className="font-bold" style={{ color: accent }}>
                      {selectedUser.name}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-[#0F2D29]/8 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl px-4 py-2 text-[13px] font-medium text-[#5B6E68] transition hover:bg-[#0F2D29]/5 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-[13px] font-medium text-white shadow-sm transition disabled:opacity-40"
                style={{ backgroundColor: INK }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    Create task
                  </>
                )}
              </button>
            </div>
          </form>
        </fieldset>
      </div>
    </div>
  );
};

export default CreateTaskModal;
