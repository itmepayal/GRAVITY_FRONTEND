import { useState, useMemo } from "react";
import {
  X,
  Loader2,
  Flag,
  CalendarDays,
  UserCircle2,
  Zap,
  Check,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Paperclip,
  FileText,
  ListChecks,
  AlertCircle,
  Download,
  AlertTriangle,
  Copy,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  Wand2,
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
} from "@/pages/dashboard/board/type";
import { STATUS_ORDER } from "./CreateTaskModal";
import { useGetTaskById } from "@/hooks/queries/task/use-get-task-by-id";
import { useUpdateTask } from "@/hooks/mutations/task/use-update-task";
import { useDeleteTask } from "@/hooks/mutations/task/use-delete-task";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";
import { useAddSubTask } from "@/hooks/mutations/task/use-add-subtask";
import { useUpdateSubTask } from "@/hooks/mutations/task/use-update-subtask";
import { useDeleteSubTask } from "@/hooks/mutations/task/use-delete-subtask";
import { useAddWatcher } from "@/hooks/mutations/task/use-add-watcher";
import { useRemoveWatcher } from "@/hooks/mutations/task/use-remove-watcher";
import { useArchiveTask } from "@/hooks/mutations/task/use-archive-task";
import { useAssignTask } from "@/hooks/mutations/task/use-assign-task";
import { useMoveTask } from "@/hooks/mutations/task/use-move-task";
import { STATUS_META, type TaskStatus } from "@/types/task";

// NOTE: the three task hooks above (useGetTaskById / useUpdateTask /
// useDeleteTask) are assumed to follow the same naming/path convention as
// your board hooks (use-get-board-by-id, use-update-board, use-delete-board).
// If your actual hooks live somewhere else or are named differently, just
// fix these three import paths — everything else is hook-agnostic.
//
// The five hooks imported above (useAddWatcher, useRemoveWatcher,
// useArchiveTask, useAssignTask, useMoveTask) are the ones you supplied.
// Paths assumed as @/hooks/mutations/task/use-<kebab-name> — adjust if
// yours differ.

interface ApiRef {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  email?: string;
}

type RefValue = string | ApiRef | null | undefined;

function refLabel(ref: RefValue): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  return ref.name ?? ref.title ?? ref.email ?? ref.id ?? ref._id;
}

function refId(ref: RefValue): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  return ref.id ?? ref._id;
}

const AVATAR_PALETTE: { bg: string; fg: string }[] = [
  { bg: "#DCEEE6", fg: "#0F5C42" },
  { bg: "#E4E9FB", fg: "#33409B" },
  { bg: "#FCEFD0", fg: "#8A5A00" },
  { bg: "#FBEAE9", fg: "#B3261E" },
  { bg: "#EAE3F7", fg: "#5B3A9B" },
  { bg: MINT, fg: INK },
];

function avatarStyle(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface ApiSubTask {
  id?: string;
  _id?: string;
  title: string;
  completed: boolean;
}

const STATUS_TO_COLUMN: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  testing: "Testing",
  completed: "Done",
  blocked: "Blocked",
};

interface ApiAttachment {
  id?: string;
  _id?: string;
  name: string;
  url?: string;
  size?: number;
}

interface ApiTaskDetail {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  column: string;

  workspace?: RefValue;
  project?: RefValue;
  board?: RefValue;
  sprint?: RefValue;

  assignee?: RefValue;
  watchers?: RefValue[];

  status: TaskStatus;
  priority: Priority;
  tags: string[];
  dueDate: string | null;
  estimatedHours?: number;
  actualHours?: number;
  subtasks?: ApiSubTask[];
  attachments?: ApiAttachment[];
  commentsCount?: number;
  isArchived?: boolean;
}

function unwrapObject<T>(res: any): T | undefined {
  if (!res) return undefined;
  if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
    return res.data as T;
  }
  return res as T;
}

function unwrapList<T>(res: any): T[] {
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res?.data)) return res.data as T[];
  return [];
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toDateInputValue(dueDate?: string | null): string {
  if (!dueDate) return "";
  return dueDate.slice(0, 10);
}

function formatDisplayDate(dueDate?: string | null): string {
  if (!dueDate) return "No due date";
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return dueDate;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
  onChanged: () => void;
}

export const TaskDetailModal = ({
  taskId,
  onClose,
  onChanged,
}: TaskDetailModalProps) => {
  const { data: taskRes, isLoading, isError } = useGetTaskById(taskId);
  const task = useMemo(() => unwrapObject<ApiTaskDetail>(taskRes), [taskRes]);

  const { data: usersRes } = useGetAllUsers();
  const userOptions = unwrapList<any>(usersRes).map((u) => ({
    id: u._id ?? u.id,
    name: u.name ?? u.fullName ?? u.email ?? "Unknown",
  }));

  const assigneeLabel = useMemo(() => {
    if (!task?.assignee) return undefined;
    const id = refId(task.assignee);
    const fromUsers = userOptions.find((u) => u.id === id)?.name;
    return fromUsers ?? refLabel(task.assignee);
  }, [task, userOptions]);

  const { mutate: updateTaskMutate, isPending: isUpdating } = useUpdateTask();
  const { mutate: deleteTaskMutate, isPending: isDeleting } = useDeleteTask();

  // --- Subtask-specific mutations (dedicated endpoints, same as
  // TaskDetailDrawer) so add/update/delete don't require resending the
  // entire task payload. ---
  const { mutate: addSubTaskMutate, isPending: isAddingSubtask } =
    useAddSubTask();
  const { mutate: updateSubTaskMutate, isPending: isTogglingSubtask } =
    useUpdateSubTask();
  const { mutate: deleteSubTaskMutate, isPending: isDeletingSubtask } =
    useDeleteSubTask();

  // --- Dedicated single-purpose mutations -------------------------------
  const { mutate: archiveTaskMutate, isPending: isArchivingTask } =
    useArchiveTask();
  const { mutate: assignTaskMutate, isPending: isAssigningTask } =
    useAssignTask();
  const { mutate: moveTaskMutate, isPending: isMovingTask } = useMoveTask();
  const { mutate: addWatcherMutate, isPending: isAddingWatcher } =
    useAddWatcher();
  const { mutate: removeWatcherMutate, isPending: isRemovingWatcher } =
    useRemoveWatcher();

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [tags, setTags] = useState<TagName[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<string>("");
  const [actualHours, setActualHours] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState("");

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newWatcherId, setNewWatcherId] = useState("");
  const [quickAssignId, setQuickAssignId] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [titleCopied, setTitleCopied] = useState(false);
  const [shakeDeleteCard, setShakeDeleteCard] = useState(false);

  const startEditing = () => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setTags((task.tags ?? []).filter((t): t is TagName => t in TAG_COLORS));
    setDueDate(toDateInputValue(task.dueDate));
    setEstimatedHours(
      typeof task.estimatedHours === "number"
        ? String(task.estimatedHours)
        : "",
    );
    setActualHours(
      typeof task.actualHours === "number" ? String(task.actualHours) : "",
    );
    setAssigneeId(refId(task.assignee) ?? "");
    setIsEditing(true);
  };

  const toggleTag = (tag: TagName) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const taskDbId = task?.id ?? task?._id ?? taskId;

  const handleSaveEdit = () => {
    if (!title.trim()) return;

    const nextColumn = STATUS_TO_COLUMN[status] ?? task?.column;

    updateTaskMutate(
      {
        taskId: taskDbId,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          column: nextColumn,
          priority,
          tags,
          dueDate: dueDate || null,
          estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
          actualHours: actualHours ? Number(actualHours) : undefined,
          assignee: assigneeId || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          onChanged();
        },
      },
    );
  };

  // --- Archive / unarchive ----------------------------------------------
  // useArchiveTask only archives (its mutationFn takes just a taskId, no
  // direction flag), so it's used for the forward action. There's no
  // dedicated "unarchive" hook among the ones you gave me, so restoring a
  // task falls back to the generic update mutation with isArchived: false.
  // Swap that branch for a real useUnarchiveTask() if/when you add one.
  const handleToggleArchive = () => {
    if (!task) return;
    if (task.isArchived) {
      updateTaskMutate(
        { taskId: taskDbId, data: { isArchived: false } },
        { onSuccess: () => onChanged() },
      );
      return;
    }
    archiveTaskMutate(taskDbId, { onSuccess: () => onChanged() });
  };

  // --- Quick assign (outside the edit form) ------------------------------
  const handleQuickAssign = (userId: string) => {
    if (!userId || !task) return;
    assignTaskMutate(
      { taskId: taskDbId, assigneeId: userId },
      {
        onSuccess: () => {
          setQuickAssignId("");
          onChanged();
        },
      },
    );
  };

  // --- Move task (used to fix the status/column desync warning) ---------
  const handleSyncColumn = () => {
    if (!task) return;
    const correctColumn = STATUS_TO_COLUMN[task.status];
    if (!correctColumn) return;
    moveTaskMutate(
      {
        taskId: taskDbId,
        data: { column: correctColumn, status: task.status },
      },
      { onSuccess: () => onChanged() },
    );
  };

  // --- Watchers -----------------------------------------------------------
  const watcherIds = new Set(
    (task?.watchers ?? []).map((w) => refId(w)).filter(Boolean) as string[],
  );
  const watcherCandidates = userOptions.filter((u) => !watcherIds.has(u.id));

  const handleAddWatcher = (userId: string) => {
    if (!userId) return;
    addWatcherMutate(
      { taskId: taskDbId, userId },
      {
        onSuccess: () => {
          setNewWatcherId("");
          onChanged();
        },
      },
    );
  };

  const handleRemoveWatcher = (userId: string | undefined) => {
    if (!userId) return;
    removeWatcherMutate(
      { taskId: taskDbId, userId },
      { onSuccess: () => onChanged() },
    );
  };

  // --- Subtask handlers -----------------------------------------------

  const handleToggleSubtask = (
    subtaskId: string | undefined,
    completed: boolean,
  ) => {
    if (!subtaskId) return;
    updateSubTaskMutate(
      { taskId: taskDbId, subtaskId, data: { completed: !completed } },
      { onSuccess: () => onChanged() },
    );
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    addSubTaskMutate(
      { taskId: taskDbId, data: { title: newSubtaskTitle.trim() } },
      {
        onSuccess: () => {
          setNewSubtaskTitle("");
          onChanged();
        },
      },
    );
  };

  const handleDeleteSubtask = (subtaskId: string | undefined) => {
    if (!subtaskId) return;
    deleteSubTaskMutate(
      { taskId: taskDbId, subtaskId },
      { onSuccess: () => onChanged() },
    );
  };

  // ----------------------------------------------------------------------

  const handleDelete = () => {
    if (!task) return;
    setDeleteConfirmText("");
    setShowDeleteConfirm(true);
  };

  const isDeleteConfirmed =
    deleteConfirmText.trim() === (task?.title ?? "").trim() &&
    deleteConfirmText.trim().length > 0;

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
  };

  const handleConfirmDelete = () => {
    if (!isDeleteConfirmed) {
      setShakeDeleteCard(true);
      window.setTimeout(() => setShakeDeleteCard(false), 420);
      return;
    }
    deleteTaskMutate(taskDbId, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setDeleteConfirmText("");
        onChanged();
        onClose();
      },
    });
  };

  const handleCopyTitle = async () => {
    if (!task?.title) return;
    try {
      await navigator.clipboard.writeText(task.title);
      setTitleCopied(true);
      window.setTimeout(() => setTitleCopied(false), 1500);
    } catch {}
  };

  const assigneeAvatarPalette = assigneeLabel
    ? avatarStyle(assigneeLabel)
    : { bg: MINT, fg: INK };

  const isArchiveBusy = isUpdating || isArchivingTask;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0F2D29]/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      onClick={() => !isUpdating && !isDeleting && onClose()}
    >
      <div
        className="flex h-full w-full max-w-2xl sm:max-w-3xl flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="shrink-0 bg-[#0F2D29] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: TEAL }}
              >
                <ListChecks size={16} className="text-white" />
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-white">
                  Task Details
                </h2>
                {task?.isArchived && (
                  <p className="text-[11px] text-[#B7CFC7]">Archived</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {!isEditing && task && (
                <>
                  <button
                    onClick={handleToggleArchive}
                    disabled={isArchiveBusy}
                    title={task.isArchived ? "Unarchive" : "Archive"}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B7CFC7] transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                  >
                    {isArchiveBusy ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : task.isArchived ? (
                      <ArchiveRestore size={15} />
                    ) : (
                      <Archive size={15} />
                    )}
                  </button>
                  <button
                    onClick={startEditing}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B7CFC7] transition hover:bg-white/10 hover:text-white"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#F3B7B0] transition hover:bg-white/10 disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B7CFC7] transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#F5F4EF] p-6">
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 size={20} className="animate-spin text-[#0F8A65]" />
            </div>
          )}

          {isError && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <AlertCircle size={22} style={{ color: "#B3261E" }} />
              <p className="text-xs font-semibold" style={{ color: INK }}>
                Couldn't load this task.
              </p>
            </div>
          )}

          {task && !isEditing && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-4">
                <h3
                  className="mb-1.5 text-[15px] font-bold"
                  style={{ color: INK }}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-[12.5px] leading-relaxed text-[#5B6E68]">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-3">
                  <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[#8FA69E]">
                    Status
                  </p>
                  <span
                    className="inline-flex items-center px-2 py-1 text-[11px] font-bold"
                    style={{
                      color: STATUS_META[task.status].color,
                      backgroundColor: STATUS_META[task.status].bg,
                    }}
                  >
                    {STATUS_META[task.status].label}
                  </span>
                  {STATUS_TO_COLUMN[task.status] &&
                    STATUS_TO_COLUMN[task.status] !== task.column && (
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <p
                          className="flex items-center gap-1 text-[10px] font-semibold"
                          style={{ color: "#B3261E" }}
                          title={`Status says "${STATUS_TO_COLUMN[task.status]}" but the card is sitting in the "${task.column}" column.`}
                        >
                          <AlertCircle size={10} />
                          Out of sync with "{task.column}"
                        </p>
                        <button
                          type="button"
                          onClick={handleSyncColumn}
                          disabled={isMovingTask}
                          title={`Move card to "${STATUS_TO_COLUMN[task.status]}" column`}
                          className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide transition hover:bg-[#FBEAE9] disabled:opacity-40"
                          style={{
                            color: "#B3261E",
                            backgroundColor: "#FBEAE955",
                          }}
                        >
                          {isMovingTask ? (
                            <Loader2 size={9} className="animate-spin" />
                          ) : (
                            <Wand2 size={9} />
                          )}
                          Fix
                        </button>
                      </div>
                    )}
                </div>
                <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-3">
                  <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[#8FA69E]">
                    Priority
                  </p>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold"
                    style={{
                      color: PRIORITY_META[task.priority].color,
                      backgroundColor: PRIORITY_META[task.priority].bg,
                    }}
                  >
                    <Flag size={10} />
                    {PRIORITY_META[task.priority].label}
                  </span>
                </div>
              </div>

              {task.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => {
                    const meta = TAG_COLORS[tag as TagName] || {
                      color: INK,
                      bg: "#EDEBE3",
                    };
                    return (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: meta.color, backgroundColor: meta.bg }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-3">
                  <p className="mb-1 flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-[#8FA69E]">
                    <UserCircle2 size={11} /> Assignee
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center text-[9px] font-bold"
                      style={{
                        backgroundColor: assigneeAvatarPalette.bg,
                        color: assigneeAvatarPalette.fg,
                      }}
                    >
                      {assigneeLabel ? initials(assigneeLabel) : "—"}
                    </span>
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: INK }}
                    >
                      {assigneeLabel || "Unassigned"}
                    </span>
                  </div>
                  {/* Quick assign — reassigns immediately via useAssignTask,
                      no need to enter the edit form. */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <select
                      value={quickAssignId}
                      onChange={(e) => {
                        setQuickAssignId(e.target.value);
                        handleQuickAssign(e.target.value);
                      }}
                      disabled={isAssigningTask}
                      className="w-full rounded border border-[#0F2D29]/15 bg-white px-1.5 py-1 text-[10.5px] font-medium text-[#5B6E68] disabled:opacity-50"
                    >
                      <option value="">Reassign to...</option>
                      {userOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    {isAssigningTask && (
                      <Loader2
                        size={12}
                        className="shrink-0 animate-spin text-[#0F8A65]"
                      />
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-3">
                  <p className="mb-1 flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-[#8FA69E]">
                    <CalendarDays size={11} /> Due date
                  </p>
                  <p className="text-[12px] font-medium" style={{ color: INK }}>
                    {formatDisplayDate(task.dueDate)}
                  </p>
                </div>
              </div>

              {(typeof task.estimatedHours === "number" ||
                typeof task.actualHours === "number") && (
                <div className="grid grid-cols-2 gap-3">
                  {typeof task.estimatedHours === "number" && (
                    <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-3">
                      <p className="mb-1 flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-[#8FA69E]">
                        <Zap size={11} /> Estimated hours
                      </p>
                      <p
                        className="text-[12px] font-medium"
                        style={{ color: INK }}
                      >
                        {task.estimatedHours}h
                      </p>
                    </div>
                  )}
                  {typeof task.actualHours === "number" && (
                    <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-3">
                      <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[#8FA69E]">
                        Actual hours
                      </p>
                      <p
                        className="text-[12px] font-medium"
                        style={{ color: INK }}
                      >
                        {task.actualHours}h
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Subtasks — now with add + delete, not just toggle. The
                  section always renders (even with 0 subtasks) so the
                  add-subtask form is always reachable from here. */}
              <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-4">
                <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8FA69E]">
                  <ListChecks size={12} /> Subtasks
                  {task.subtasks && task.subtasks.length > 0 && (
                    <span>
                      ({task.subtasks.filter((s) => s.completed).length}/
                      {task.subtasks.length})
                    </span>
                  )}
                </p>

                {task.subtasks && task.subtasks.length > 0 ? (
                  <ul className="mb-3 space-y-1.5">
                    {task.subtasks.map((s, i) => {
                      const stId = s.id ?? s._id;
                      return (
                        <li
                          key={stId ?? i}
                          className="flex items-center gap-2 group"
                        >
                          <button
                            onClick={() =>
                              handleToggleSubtask(stId, s.completed)
                            }
                            disabled={isTogglingSubtask}
                            className="flex flex-1 items-center gap-2 text-left text-[12px] disabled:opacity-50"
                            style={{
                              color: s.completed ? "#0F8A65" : INK,
                              textDecoration: s.completed
                                ? "line-through"
                                : "none",
                            }}
                          >
                            <span
                              className="flex h-4 w-4 shrink-0 items-center justify-center border"
                              style={{
                                borderColor: s.completed
                                  ? "#0F8A65"
                                  : `${INK}44`,
                                backgroundColor: s.completed
                                  ? "#E7F5EF"
                                  : "white",
                              }}
                            >
                              {s.completed && (
                                <Check size={10} color="#0F8A65" />
                              )}
                            </span>
                            {s.title}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubtask(stId)}
                            disabled={isDeletingSubtask}
                            aria-label={`Delete subtask ${s.title}`}
                            className="shrink-0 p-0.5 text-[#8FA69E] opacity-0 transition group-hover:opacity-100 hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 size={13} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mb-3 text-[11px] font-medium text-[#8FA69E]">
                    No subtasks yet.
                  </p>
                )}

                <form
                  onSubmit={handleAddSubtask}
                  className="flex items-center gap-2"
                >
                  <input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a subtask..."
                    disabled={isAddingSubtask}
                    className={`${inputClass} flex-1 text-[12px] disabled:opacity-60`}
                  />
                  <button
                    type="submit"
                    disabled={isAddingSubtask || !newSubtaskTitle.trim()}
                    className="inline-flex shrink-0 items-center gap-1 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-40"
                    style={{ backgroundColor: INK }}
                  >
                    {isAddingSubtask ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Plus size={12} />
                    )}
                    Add
                  </button>
                </form>
              </div>

              {/* Organization — workspace / project / board / sprint this
                  task belongs to. Renders whichever of these the API
                  actually sends (populated object or raw id string). */}
              {(task.workspace ||
                task.project ||
                task.board ||
                task.sprint) && (
                <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-4">
                  <p className="mb-2.5 text-[10.5px] font-bold uppercase tracking-wide text-[#8FA69E]">
                    Organization
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {refLabel(task.workspace) && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold"
                        style={{ color: INK, backgroundColor: "#EDEBE3" }}
                        title={refId(task.workspace)}
                      >
                        Workspace · {refLabel(task.workspace)}
                      </span>
                    )}
                    {refLabel(task.project) && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold"
                        style={{ color: TEAL, backgroundColor: "#E7F5EF" }}
                        title={refId(task.project)}
                      >
                        Project · {refLabel(task.project)}
                      </span>
                    )}
                    {refLabel(task.board) && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold"
                        style={{ color: INK, backgroundColor: MINT }}
                        title={refId(task.board)}
                      >
                        Board · {refLabel(task.board)}
                      </span>
                    )}
                    {refLabel(task.sprint) && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold"
                        style={{ color: "#8A5A00", backgroundColor: "#FCEFD0" }}
                        title={refId(task.sprint)}
                      >
                        <Zap size={10} />
                        Sprint · {refLabel(task.sprint)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Watchers — people following this task, separate from the
                  single assignee shown above. Add via useAddWatcher,
                  remove via useRemoveWatcher. Section always renders so the
                  add-watcher control is always reachable. */}
              <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-4">
                <p className="mb-2.5 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#8FA69E]">
                  <Eye size={11} /> Watchers
                  {task.watchers && task.watchers.length > 0 && (
                    <span>({task.watchers.length})</span>
                  )}
                </p>

                {task.watchers && task.watchers.length > 0 ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {task.watchers.map((w, i) => {
                      const label = refLabel(w) ?? "—";
                      const id = refId(w);
                      const palette = avatarStyle(label);
                      return (
                        <span
                          key={id ?? i}
                          className="group flex items-center gap-1.5 border py-1 pl-1 pr-2"
                          style={{ borderColor: `${INK}15` }}
                          title={id}
                        >
                          <span
                            className="flex h-5 w-5 items-center justify-center text-[9px] font-bold"
                            style={{
                              backgroundColor: palette.bg,
                              color: palette.fg,
                            }}
                          >
                            {initials(label)}
                          </span>
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: INK }}
                          >
                            {label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveWatcher(id)}
                            disabled={isRemovingWatcher}
                            aria-label={`Remove watcher ${label}`}
                            className="ml-0.5 shrink-0 text-[#8FA69E] opacity-0 transition group-hover:opacity-100 hover:text-red-600 disabled:opacity-40"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mb-3 text-[11px] font-medium text-[#8FA69E]">
                    No watchers yet.
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <select
                    value={newWatcherId}
                    onChange={(e) => setNewWatcherId(e.target.value)}
                    disabled={isAddingWatcher || watcherCandidates.length === 0}
                    className={`${inputClass} flex-1 text-[12px] disabled:opacity-60`}
                  >
                    <option value="">
                      {watcherCandidates.length === 0
                        ? "Everyone is already watching"
                        : "Add a watcher..."}
                    </option>
                    {watcherCandidates.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddWatcher(newWatcherId)}
                    disabled={isAddingWatcher || !newWatcherId}
                    className="inline-flex shrink-0 items-center gap-1 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-40"
                    style={{ backgroundColor: INK }}
                  >
                    {isAddingWatcher ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Plus size={12} />
                    )}
                    Add
                  </button>
                </div>
              </div>

              {/* Attachments — the section always renders, even when empty,
                  so it's obvious whether a task genuinely has none vs.
                  attachments failing to save (see Board.tsx fix). */}
              <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-4">
                <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8FA69E]">
                  <Paperclip size={12} /> Attachments
                  {task.attachments && task.attachments.length > 0 && (
                    <span>({task.attachments.length})</span>
                  )}
                </p>
                {task.attachments && task.attachments.length > 0 ? (
                  <ul className="space-y-1.5">
                    {task.attachments.map((a, i) => (
                      <li
                        key={a.id ?? a._id ?? i}
                        className="flex items-center justify-between gap-2 border px-2.5 py-1.5 text-[11px]"
                        style={{ borderColor: `${INK}15` }}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center"
                            style={{ backgroundColor: MINT }}
                          >
                            <FileText size={12} style={{ color: INK }} />
                          </span>
                          <div className="min-w-0">
                            <p
                              className="truncate font-medium"
                              style={{ color: INK }}
                              title={a.name}
                            >
                              {a.name}
                            </p>
                            {typeof a.size === "number" && (
                              <p className="text-[10px] text-[#8FA69E]">
                                {formatFileSize(a.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        {a.url && (
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 p-0.5"
                            style={{ color: "#0F8A65" }}
                          >
                            <Download size={13} />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] font-medium text-[#8FA69E]">
                    No attachments on this task.
                  </p>
                )}
              </div>
            </div>
          )}

          {task && isEditing && (
            <div className="space-y-4">
              <div className="space-y-3 rounded-xl border border-[#0F2D29]/10 bg-white p-4">
                <div>
                  <label
                    className="mb-1 block text-[11px] font-bold"
                    style={{ color: `${INK}B3` }}
                  >
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-[11px] font-bold"
                    style={{ color: `${INK}B3` }}
                  >
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="mb-1 block text-[11px] font-bold"
                      style={{ color: `${INK}B3` }}
                    >
                      Status
                    </label>
                    <select
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
                  <div>
                    <label
                      className="mb-1 block text-[11px] font-bold"
                      style={{ color: `${INK}B3` }}
                    >
                      Assignee
                    </label>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Unassigned</option>
                      {userOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-[11px] font-bold"
                    style={{ color: `${INK}B3` }}
                  >
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
                          className="flex items-center gap-1.5 border px-3 py-1.5 text-[11px] font-bold"
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
                  <label
                    className="mb-1.5 block text-[11px] font-bold"
                    style={{ color: `${INK}B3` }}
                  >
                    Tags
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
                          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                          style={{
                            color: active ? meta.color : `${INK}66`,
                            backgroundColor: active ? meta.bg : "#EDEBE3",
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label
                      className="mb-1 block text-[11px] font-bold"
                      style={{ color: `${INK}B3` }}
                    >
                      Due date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-[11px] font-bold"
                      style={{ color: `${INK}B3` }}
                    >
                      Est. hours
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-[11px] font-bold"
                      style={{ color: `${INK}B3` }}
                    >
                      Actual hours
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={actualHours}
                      onChange={(e) => setActualHours(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-[13px] font-medium text-[#5B6E68] disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!title.trim() || isUpdating}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-medium text-white disabled:opacity-40"
                  style={{ backgroundColor: INK }}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && task && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-[#0A211D]/70 p-4 backdrop-blur-md"
          onClick={closeDeleteConfirm}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#0F2D29]/10 bg-white"
            style={{
              boxShadow: "0 24px 70px -18px rgba(15,45,41,0.45)",
              animation: shakeDeleteCard
                ? "taskDeleteModalIn 0.18s ease-out, taskDeleteShake 0.42s ease-in-out"
                : "taskDeleteModalIn 0.18s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="h-1 w-full"
              style={{
                background: "linear-gradient(90deg, #E5484D 0%, #9A2420 100%)",
              }}
            />

            <div className="p-6">
              {" "}
              <div className="mb-4 flex items-start gap-3">
                <span
                  className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "#FBEAE9",
                    boxShadow: "0 0 0 4px #FBEAE955",
                  }}
                >
                  <AlertTriangle size={19} style={{ color: "#B3261E" }} />
                </span>
                <div className="pt-0.5">
                  <h3
                    className="text-[15.5px] font-black tracking-tight"
                    style={{ color: INK }}
                  >
                    Delete this task?
                  </h3>
                  <p className="mt-0.5 text-[12px] font-medium leading-snug text-[#5B6E68]">
                    This permanently removes the task, its subtasks, and
                    attachments. There's no undo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  disabled={isDeleting}
                  className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#8FA69E] transition hover:bg-[#F5F4EF] hover:text-[#5B6E68] disabled:opacity-40"
                >
                  <X size={14} />
                </button>
              </div>
              {/* Task preview — lets the person visually double-check this
                  is really the task they mean to remove. */}
              <div
                className="mb-4 rounded-xl border p-3"
                style={{ borderColor: `${INK}14`, backgroundColor: "#F9F8F4" }}
              >
                <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wider text-[#8FA69E]">
                  You're deleting
                </p>
                <p
                  className="mb-2 text-[13px] font-bold leading-snug"
                  style={{ color: INK }}
                >
                  {task.title}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                    style={{
                      color: PRIORITY_META[task.priority].color,
                      backgroundColor: PRIORITY_META[task.priority].bg,
                    }}
                  >
                    <Flag size={9} />
                    {PRIORITY_META[task.priority].label}
                  </span>
                  {task.tags?.slice(0, 3).map((tag) => {
                    const meta = TAG_COLORS[tag as TagName] || {
                      color: INK,
                      bg: "#EDEBE3",
                    };
                    return (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                        style={{ color: meta.color, backgroundColor: meta.bg }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#8FA69E]">
                      <ListChecks size={11} />
                      {task.subtasks.length} subtask
                      {task.subtasks.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </div>
              {/* Type-to-confirm */}
              <label className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-[#5B6E68]">
                <span>
                  Type{" "}
                  <button
                    type="button"
                    onClick={handleCopyTitle}
                    className="group inline-flex items-center gap-1 rounded px-1 py-0.5 font-mono font-bold transition"
                    style={{ color: INK, backgroundColor: "#EDEBE3" }}
                    title="Copy title"
                  >
                    {task.title}
                    {titleCopied ? (
                      <CheckCircle2 size={11} style={{ color: "#0F8A65" }} />
                    ) : (
                      <Copy
                        size={11}
                        className="opacity-0 transition group-hover:opacity-100"
                      />
                    )}
                  </button>{" "}
                  to confirm
                </span>
              </label>
              <div className="relative mb-1.5">
                <input
                  autoFocus
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmDelete();
                    if (e.key === "Escape") closeDeleteConfirm();
                  }}
                  placeholder="Type the task title exactly..."
                  disabled={isDeleting}
                  spellCheck={false}
                  autoComplete="off"
                  className={`${inputClass} pr-9 font-medium transition-colors`}
                  style={{
                    borderColor: deleteConfirmText
                      ? isDeleteConfirmed
                        ? "#0F8A65"
                        : "#B3261E"
                      : `${INK}33`,
                    backgroundColor: isDeleteConfirmed ? "#F1F9F5" : "white",
                  }}
                />
                {deleteConfirmText && (
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                    {isDeleteConfirmed ? (
                      <CheckCircle2 size={15} style={{ color: "#0F8A65" }} />
                    ) : (
                      <XCircle size={15} style={{ color: "#B3261E" }} />
                    )}
                  </span>
                )}
              </div>
              <p
                className="mb-5 h-4 text-[11px] font-semibold"
                style={{ color: isDeleteConfirmed ? "#0F8A65" : "#B3261E" }}
              >
                {deleteConfirmText
                  ? isDeleteConfirmed
                    ? "Title matches — you're clear to delete."
                    : "Doesn't match the task title yet."
                  : ""}
              </p>
              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  disabled={isDeleting}
                  className="rounded-lg px-3.5 py-2 text-xs font-bold transition hover:bg-[#F5F4EF] disabled:opacity-40"
                  style={{ color: `${INK}B3` }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition disabled:cursor-not-allowed"
                  style={{
                    background: isDeleteConfirmed
                      ? "linear-gradient(180deg, #C6362F 0%, #9A2420 100%)"
                      : "#C9C4B6",
                    boxShadow: isDeleteConfirmed
                      ? "0 6px 16px -4px rgba(154,36,32,0.5)"
                      : "none",
                  }}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      Delete task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailModal;
