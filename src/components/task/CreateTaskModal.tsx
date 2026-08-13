import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
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
  Paperclip,
  UploadCloud,
  FileText,
  MessageSquare,
  Archive,
  KanbanSquare,
  Info,
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
import { useGetProjectBoards } from "@/hooks/queries/project/use-get-project-boards";
import { useGetProjectSprints } from "@/hooks/queries/project/use-get-project-sprints";
import { useCreateTask } from "@/hooks/mutations/task/use-create-task";
import type { TaskResponse } from "@/types/task";

type TaskStatus =
  | "todo"
  | "in_progress"
  | "in_review"
  | "testing"
  | "completed"
  | "blocked";

const STATUS_META: Record<
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

export interface NewSubTaskInput {
  title: string;
  completed: boolean;
}

export interface NewAttachmentInput {
  file: File;
  name: string;
  size: number;
}

const MAX_ATTACHMENTS = 6;
const MAX_ATTACHMENT_MB = 15;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface NewTaskInput {
  title: string;
  description?: string;

  board: string;
  project: string;
  workspace: string;
  sprint?: string;

  column: string;

  assignee?: string;
  watchers: string[];

  status: TaskStatus;
  priority: Priority;

  tags: TagName[];

  dueDate: string | null;
  completedAt: string | null;

  estimatedHours?: number;
  actualHours?: number;

  subtasks: NewSubTaskInput[];
  attachments: NewAttachmentInput[];

  initialComment?: string;

  isArchived: boolean;

  assigneeLabel: string;
}

// 🔧 Serializes the task input into FormData the way the backend expects:
// a single "data" field carrying the JSON payload, plus raw files under
// "attachments". Matches createTaskController's `JSON.parse(req.body.data)`.
function buildTaskFormData(input: NewTaskInput): FormData {
  const formData = new FormData();

  const { attachments, ...rest } = input;
  formData.append("data", JSON.stringify(rest));

  attachments.forEach((a) => {
    formData.append("attachments", a.file, a.name);
  });

  return formData;
}

interface CreateTaskModalProps {
  columns: string[];
  defaultColumn: string;
  boardType: BoardType;
  defaultBoardId?: string; // 🔧 renamed from boardId — now just a preselect hint
  onClose: () => void;

  onCreated?: (task: TaskResponse) => void;
}

function unwrapList<T>(res: any): T[] {
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res?.data)) return res.data as T[];
  return [];
}

function defaultStatusForColumn(column: string): TaskStatus {
  const key = column.trim().toLowerCase();
  if (key.includes("progress")) return "in_progress";
  if (key.includes("review")) return "in_review";
  if (key.includes("test") || key.includes("qa")) return "testing";
  if (key.includes("done") || key.includes("complete")) return "completed";
  if (key.includes("block")) return "blocked";
  return "todo";
}

const SECTIONS = [
  { id: "basics", label: "Basics", icon: ListTodo },
  { id: "context", label: "Location & Sprint", icon: Briefcase },
  { id: "people", label: "People", icon: Users },
  { id: "priority", label: "Priority & Tags", icon: Flag },
  { id: "schedule", label: "Schedule & Hours", icon: CalendarDays },
  { id: "subtasks", label: "Subtasks", icon: ListChecks },
  { id: "attachments", label: "Attachments", icon: Paperclip },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "advanced", label: "Advanced", icon: Archive },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function FieldLabel({
  icon,
  required,
  optional,
  children,
}: {
  icon?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#0F2D29]">
      {icon}
      {children}
      {required && <span className="text-[#B3261E]">*</span>}
      {optional && (
        <span className="text-[11px] font-normal text-[#8FA69E]">
          (optional)
        </span>
      )}
    </label>
  );
}

function SectionHeading({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-2.5 border-b border-[#0F2D29]/10 pb-3">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: "#E7F5EF", color: "#0F8A65" }}
      >
        {icon}
      </span>
      <div>
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#0F2D29]">
          {title}
        </h3>
        {hint && <p className="mt-0.5 text-[11.5px] text-[#8FA69E]">{hint}</p>}
      </div>
    </div>
  );
}

export const CreateTaskModal = ({
  columns = [],
  defaultColumn = "",
  boardType = "kanban" as BoardType,
  defaultBoardId = "",
  onClose,
  onCreated,
}: CreateTaskModalProps) => {
  const [activeSection, setActiveSection] = useState<SectionId>("basics");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [column, setColumn] = useState(defaultColumn || columns[0] || "");
  const [status, setStatus] = useState<TaskStatus>(
    defaultStatusForColumn(defaultColumn || columns[0] || ""),
  );
  const [priority, setPriority] = useState<Priority>("medium");
  const [tags, setTags] = useState<TagName[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<string>("");
  const [actualHours, setActualHours] = useState<string>("");
  const [isArchived, setIsArchived] = useState(false);
  const [initialComment, setInitialComment] = useState("");

  // workspace -> project -> board / sprint cascading selects
  const [workspaceId, setWorkspaceId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [boardId, setBoardId] = useState(defaultBoardId); // 🔧 now state, not a fixed prop
  const [sprintId, setSprintId] = useState("");

  // assignee + watchers (multi)
  const [assigneeId, setAssigneeId] = useState("");
  const [watcherIds, setWatcherIds] = useState<string[]>([]);

  // subtasks
  const [subtasks, setSubtasks] = useState<NewSubTaskInput[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState("");

  // attachments
  const [attachments, setAttachments] = useState<NewAttachmentInput[]>([]);
  const [attachmentError, setAttachmentError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: workspacesRes, isLoading: isLoadingWorkspaces } =
    useGetUserWorkspaces();
  const { data: projectsRes, isLoading: isLoadingProjects } =
    useGetWorkspaceProjects(workspaceId);
  const { data: boardsRes, isLoading: isLoadingBoards } =
    useGetProjectBoards(projectId); // 🔧 new
  const { data: sprintsRes, isLoading: isLoadingSprints } =
    useGetProjectSprints(projectId);
  const { data: usersRes, isLoading: isLoadingUsers } = useGetAllUsers();

  // The actual create-task network call. isPending drives every disabled/
  // loading state in the form below — there's no separate isSubmitting prop.
  const { mutate: createTaskMutate, isPending: isSubmitting } = useCreateTask();

  const workspaceOptions = unwrapList<any>(workspacesRes).map((ws) => ({
    id: ws._id ?? ws.id,
    name: ws.name,
  }));

  const projectOptions = unwrapList<any>(projectsRes).map((p) => ({
    id: p._id ?? p.id,
    name: p.name,
  }));

  const boardOptions = unwrapList<any>(boardsRes).map((b) => ({
    id: b._id ?? b.id,
    name: b.name,
  })); // 🔧 new

  const sprintOptions = unwrapList<any>(sprintsRes).map((s) => ({
    id: s._id ?? s.id,
    name: s.name ?? s.title ?? "Untitled sprint",
    status: s.status as string | undefined,
  }));

  const userOptions = unwrapList<any>(usersRes).map((u) => ({
    id: u._id ?? u.id,
    name: u.name ?? u.fullName ?? u.email ?? "Unknown",
  }));

  const selectedUser = userOptions.find((u) => u.id === assigneeId);
  const selectedBoard = boardOptions.find((b) => b.id === boardId); // 🔧 new

  // 🔧 If the project changes and the currently selected board no longer
  // belongs to it, clear it instead of silently sending a stale id.
  useEffect(() => {
    if (boardId && !isLoadingBoards && boardOptions.length > 0) {
      const stillExists = boardOptions.some((b) => b.id === boardId);
      if (!stillExists) setBoardId("");
    }
  }, [boardOptions, isLoadingBoards, boardId]);

  useEffect(() => {
    if (sprintId && !isLoadingSprints && sprintOptions.length > 0) {
      const stillExists = sprintOptions.some((s) => s.id === sprintId);
      if (!stillExists) setSprintId("");
    }
  }, [sprintOptions, isLoadingSprints, sprintId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleWorkspaceChange = (id: string) => {
    setWorkspaceId(id);
    setProjectId("");
    setBoardId(""); // 🔧 reset downstream
    setSprintId("");
  };

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    setBoardId(""); // 🔧 reset downstream — board options depend on project
    setSprintId("");
  };

  const handleBoardChange = (id: string) => {
    setBoardId(id);
    setSprintId(""); // reset sprint since it may be board-scoped
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

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAttachmentError("");

    const incoming = Array.from(files);
    const tooBig = incoming.filter(
      (f) => f.size > MAX_ATTACHMENT_MB * 1024 * 1024,
    );
    if (tooBig.length > 0) {
      setAttachmentError(
        `${tooBig.length > 1 ? "Some files exceed" : "File exceeds"} the ${MAX_ATTACHMENT_MB}MB limit and ${tooBig.length > 1 ? "were" : "was"} skipped.`,
      );
    }

    const accepted = incoming.filter(
      (f) => f.size <= MAX_ATTACHMENT_MB * 1024 * 1024,
    );

    setAttachments((prev) => {
      const room = MAX_ATTACHMENTS - prev.length;
      if (room <= 0) {
        setAttachmentError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
        return prev;
      }
      const next = accepted.slice(0, room).map((file) => ({
        file,
        name: file.name,
        size: file.size,
      }));
      if (accepted.length > room) {
        setAttachmentError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
      }
      return [...prev, ...next];
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentError("");
  };

  const isValid =
    title.trim().length >= 2 &&
    !!column &&
    !!projectId &&
    !!workspaceId &&
    !!boardId; // 🔧 board is now required from the dropdown

  const sectionHasContent: Record<SectionId, boolean> = {
    basics: title.trim().length > 0 || description.trim().length > 0,
    context: !!workspaceId || !!projectId || !!boardId || !!sprintId,
    people: !!assigneeId || watcherIds.length > 0,
    priority: priority !== "medium" || tags.length > 0,
    schedule: !!dueDate || !!completedAt || !!estimatedHours || !!actualHours,
    subtasks: subtasks.length > 0,
    attachments: attachments.length > 0,
    comments: initialComment.trim().length > 0,
    advanced: isArchived,
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    const input: NewTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,

      board: boardId, // 🔧 real ObjectId from the dropdown, not a slug
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
      completedAt: completedAt || null,

      estimatedHours:
        boardType === "scrum" && estimatedHours
          ? Number(estimatedHours)
          : undefined,
      actualHours: actualHours ? Number(actualHours) : undefined,

      subtasks,
      attachments,

      initialComment: initialComment.trim() || undefined,

      isArchived,

      assigneeLabel: selectedUser
        ? selectedUser.name.trim().slice(0, 3).toUpperCase()
        : "—",
    };

    const formData = buildTaskFormData(input);

    createTaskMutate(formData, {
      onSuccess: (task) => {
        onCreated?.(task);
        onClose();
      },
      // useCreateTask already shows an error toast on failure — the modal
      // just stays open with the user's input intact so they can retry.
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0F2D29]/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="flex h-full w-full max-w-2xl sm:max-w-3xl flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes ctmSectionIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .ctm-section-enter { animation: ctmSectionIn 0.18s ease-out; }
        `}</style>

        {/* ================= HEADER ================= */}
        <div className="shrink-0 bg-[#0F2D29] px-7 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg shadow-sm"
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
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B7CFC7] transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* form wraps the sidebar + scrollable content + fixed footer, so
            Enter-to-submit and the submit button keep working */}
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <fieldset
            disabled={isSubmitting}
            className="flex min-h-0 flex-1 flex-col disabled:opacity-70"
          >
            <div className="flex min-h-0 flex-1 flex-col bg-[#F5F4EF] md:flex-row">
              {/* ================= LEFT SIDEBAR — one entry per section of the Task model ================= */}
              <div className="shrink-0 border-b border-[#0F2D29]/10 bg-white md:w-56 md:border-b-0 md:border-r">
                <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible md:p-3">
                  {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const active = activeSection === section.id;
                    const filled = sectionHasContent[section.id];
                    return (
                      <button
                        type="button"
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-[12.5px] font-semibold transition"
                        style={{
                          backgroundColor: active ? accentSoft : "transparent",
                          color: active ? accent : "#5B6E68",
                        }}
                      >
                        <Icon size={14} />
                        {section.label}
                        {filled && !active && (
                          <span
                            className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: "#0F8A65" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* ================= RIGHT CONTENT — fields for the active section ================= */}
              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                {activeSection === "basics" && (
                  <div className="space-y-4">
                    <SectionHeading
                      icon={<ListTodo size={14} />}
                      title="Basics"
                      hint="ITask.title, ITask.description"
                    />
                    <div>
                      <FieldLabel required>Task Title</FieldLabel>
                      <input
                        id="task-title"
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Design the onboarding flow"
                        minLength={2}
                        maxLength={140}
                        required
                        className={`${inputClass} rounded-lg`}
                      />
                      {title && title.trim().length < 2 && (
                        <p className="mt-1 text-[11px] text-red-500">
                          Task title must be at least 2 characters.
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <FieldLabel optional>Description</FieldLabel>
                        <span className="text-[10.5px] text-[#8FA69E]">
                          {description.length}/500
                        </span>
                      </div>
                      <textarea
                        id="task-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={500}
                        rows={6}
                        placeholder="What needs to get done?"
                        className={`${inputClass} resize-none rounded-lg`}
                      />
                    </div>
                  </div>
                )}

                {activeSection === "context" && (
                  <div className="space-y-4">
                    <SectionHeading
                      icon={<Briefcase size={14} />}
                      title="Location & Sprint"
                      hint="ITask.board, ITask.workspace, ITask.project, ITask.sprint, ITask.column, ITask.status"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel
                          icon={
                            <Briefcase size={13} className="text-[#0F8A65]" />
                          }
                          required
                        >
                          Workspace
                        </FieldLabel>
                        <select
                          id="task-workspace"
                          value={workspaceId}
                          onChange={(e) =>
                            handleWorkspaceChange(e.target.value)
                          }
                          disabled={isLoadingWorkspaces}
                          required
                          className={`${inputClass} rounded-lg`}
                        >
                          <option value="">
                            {isLoadingWorkspaces
                              ? "Loading..."
                              : "Select workspace"}
                          </option>
                          {workspaceOptions.map((ws) => (
                            <option key={ws.id} value={ws.id}>
                              {ws.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <FieldLabel
                          icon={
                            <FolderKanban
                              size={13}
                              className="text-[#0F8A65]"
                            />
                          }
                          required
                        >
                          Project
                        </FieldLabel>
                        <select
                          id="task-project"
                          value={projectId}
                          onChange={(e) => handleProjectChange(e.target.value)}
                          disabled={!workspaceId || isLoadingProjects}
                          required
                          className={`${inputClass} rounded-lg`}
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

                    {/* 🔧 Board — now a real dropdown scoped to the project */}
                    <div>
                      <FieldLabel
                        icon={
                          <KanbanSquare size={13} className="text-[#0F8A65]" />
                        }
                        required
                      >
                        Board
                      </FieldLabel>
                      <select
                        id="task-board"
                        value={boardId}
                        onChange={(e) => handleBoardChange(e.target.value)}
                        disabled={!projectId || isLoadingBoards}
                        required
                        className={`${inputClass} rounded-lg`}
                      >
                        <option value="">
                          {!projectId
                            ? "Select project first"
                            : isLoadingBoards
                              ? "Loading boards..."
                              : boardOptions.length === 0
                                ? "No boards in this project"
                                : "Select board"}
                        </option>
                        {boardOptions.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[10.5px] text-[#8FA69E]">
                        Boards are scoped to the selected project.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel>Column</FieldLabel>
                        <select
                          id="task-column"
                          value={column}
                          onChange={(e) => handleColumnChange(e.target.value)}
                          className={`${inputClass} rounded-lg`}
                        >
                          {(columns ?? []).length === 0 && (
                            <option value="">No columns on this board</option>
                          )}
                          {(columns ?? []).map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <FieldLabel
                          icon={
                            <Activity size={13} className="text-[#0F8A65]" />
                          }
                        >
                          Status
                        </FieldLabel>
                        <select
                          id="task-status"
                          value={status}
                          onChange={(e) =>
                            setStatus(e.target.value as TaskStatus)
                          }
                          className={`${inputClass} rounded-lg`}
                        >
                          {(STATUS_ORDER ?? []).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_META[s]?.label ?? s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <FieldLabel
                        icon={<Zap size={13} className="text-[#0F8A65]" />}
                        optional
                      >
                        Sprint
                      </FieldLabel>
                      <select
                        id="task-sprint"
                        value={sprintId}
                        onChange={(e) => setSprintId(e.target.value)}
                        disabled={!projectId || isLoadingSprints}
                        className={`${inputClass} rounded-lg`}
                      >
                        <option value="">
                          {!projectId
                            ? "Select project first"
                            : isLoadingSprints
                              ? "Loading sprints..."
                              : sprintOptions.length === 0
                                ? "No sprints in this project"
                                : "No sprint (backlog)"}
                        </option>
                        {sprintOptions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                            {s.status ? ` · ${s.status}` : ""}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[10.5px] text-[#8FA69E]">
                        Sprints are scoped to the selected project.
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === "people" && (
                  <div className="space-y-4">
                    <SectionHeading
                      icon={<Users size={14} />}
                      title="People"
                      hint="ITask.assignee, ITask.watchers, ITask.createdBy"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel
                          icon={
                            <UserCircle2 size={13} className="text-[#0F8A65]" />
                          }
                        >
                          Assignee
                        </FieldLabel>
                        <select
                          id="task-assignee"
                          value={assigneeId}
                          onChange={(e) => setAssigneeId(e.target.value)}
                          disabled={isLoadingUsers}
                          className={`${inputClass} rounded-lg`}
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

                      <div className="flex flex-col justify-end">
                        <div
                          className="flex items-center gap-2 rounded-lg border px-2.5 py-2"
                          style={{
                            borderColor: `${INK}15`,
                            backgroundColor: "#FAFAF7",
                          }}
                        >
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                            style={{ backgroundColor: MINT, color: INK }}
                          >
                            {selectedUser
                              ? selectedUser.name
                                  .trim()
                                  .slice(0, 3)
                                  .toUpperCase()
                              : "—"}
                          </div>
                          <span className="truncate text-[12px] font-medium text-[#0F2D29]">
                            {selectedUser
                              ? selectedUser.name
                              : "No one assigned yet"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <FieldLabel
                        icon={<Users size={13} className="text-[#0F8A65]" />}
                        optional
                      >
                        Watchers
                      </FieldLabel>
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
                              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition"
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
                      <FieldLabel
                        icon={
                          <UserCircle2 size={13} className="text-[#0F8A65]" />
                        }
                      >
                        Created by
                      </FieldLabel>
                      <div
                        className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[12px] font-medium"
                        style={{
                          borderColor: `${INK}15`,
                          backgroundColor: "#FAFAF7",
                          color: `${INK}99`,
                        }}
                      >
                        <Info size={13} />
                        Set automatically to you when the task is created.
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "priority" && (
                  <div className="space-y-4">
                    <SectionHeading
                      icon={<Flag size={14} />}
                      title="Priority & Tags"
                      hint="ITask.priority, ITask.tags"
                    />

                    <div>
                      <FieldLabel
                        icon={<Flag size={13} className="text-[#0F8A65]" />}
                      >
                        Priority
                      </FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {(PRIORITY_ORDER ?? []).map((p) => {
                          const meta = PRIORITY_META?.[p];
                          if (!meta) return null;
                          const active = priority === p;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPriority(p)}
                              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition"
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
                      <FieldLabel
                        icon={<TagIcon size={13} className="text-[#0F8A65]" />}
                        optional
                      >
                        Tags
                      </FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {(ALL_TAGS ?? []).map((tag) => {
                          const meta = TAG_COLORS?.[tag];
                          if (!meta) return null;
                          const active = tags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition"
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
                  </div>
                )}

                {activeSection === "schedule" && (
                  <div className="space-y-4">
                    <SectionHeading
                      icon={<CalendarDays size={14} />}
                      title="Schedule & Hours"
                      hint="ITask.dueDate, ITask.completedAt, ITask.estimatedHours, ITask.actualHours"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel
                          icon={
                            <CalendarDays
                              size={13}
                              className="text-[#0F8A65]"
                            />
                          }
                          optional
                        >
                          Due date
                        </FieldLabel>
                        <input
                          id="task-due"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className={`${inputClass} rounded-lg`}
                        />
                      </div>

                      <div>
                        <FieldLabel
                          icon={<Check size={13} className="text-[#0F8A65]" />}
                          optional
                        >
                          Completed date
                        </FieldLabel>
                        <input
                          id="task-completed-at"
                          type="date"
                          value={completedAt}
                          onChange={(e) => setCompletedAt(e.target.value)}
                          className={`${inputClass} rounded-lg`}
                        />
                        <p className="mt-1 text-[10.5px] text-[#8FA69E]">
                          Usually left blank — set once the task is marked
                          Completed.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {boardType === "scrum" && (
                        <div>
                          <FieldLabel
                            icon={<Zap size={13} className="text-[#0F8A65]" />}
                          >
                            Est. hours
                          </FieldLabel>
                          <input
                            id="task-est-hours"
                            type="number"
                            min={0}
                            max={1000}
                            value={estimatedHours}
                            onChange={(e) => setEstimatedHours(e.target.value)}
                            placeholder="e.g. 8"
                            className={`${inputClass} rounded-lg`}
                          />
                        </div>
                      )}

                      <div>
                        <FieldLabel optional>Actual hours</FieldLabel>
                        <input
                          id="task-actual-hours"
                          type="number"
                          min={0}
                          max={1000}
                          value={actualHours}
                          onChange={(e) => setActualHours(e.target.value)}
                          placeholder="e.g. 0"
                          className={`${inputClass} rounded-lg`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "subtasks" && (
                  <div className="space-y-4">
                    <SectionHeading
                      icon={<ListChecks size={14} />}
                      title="Subtasks"
                      hint="ITask.subtasks"
                    />

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
                        className={`${inputClass} rounded-lg`}
                      />
                      <button
                        type="button"
                        onClick={addSubtask}
                        className="flex shrink-0 items-center justify-center rounded-lg border px-3 text-[#0F2D29] transition hover:bg-[#0F2D29]/5"
                        style={{ borderColor: `${INK}22` }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {subtasks.length === 0 ? (
                      <p className="text-[11.5px] text-[#8FA69E]">
                        No subtasks yet. Break this task down into smaller
                        steps.
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {subtasks.map((s, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-[11px]"
                            style={{ borderColor: `${INK}15` }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleSubtaskDone(i)}
                              className="flex items-center gap-2 text-left"
                              style={{
                                color: s.completed ? "#0F8A65" : INK,
                                textDecoration: s.completed
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              <span
                                className="flex h-4 w-4 items-center justify-center rounded border"
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
                              onClick={() => removeSubtask(i)}
                              className="rounded p-0.5 transition hover:bg-red-50"
                              style={{ color: "#B3261E" }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {activeSection === "attachments" && (
                  <div className="space-y-4">
                    <SectionHeading
                      icon={<Paperclip size={14} />}
                      title="Attachments"
                      hint="ITask.attachments"
                    />

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleFilesSelected(e.target.files)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={attachments.length >= MAX_ATTACHMENTS}
                      className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition hover:bg-[#0F8A65]/5 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ borderColor: `${INK}2A` }}
                    >
                      <UploadCloud size={18} className="text-[#0F8A65]" />
                      <span className="text-[11.5px] font-semibold text-[#0F2D29]">
                        Click to add files
                      </span>
                      <span className="text-[10.5px] text-[#8FA69E]">
                        Up to {MAX_ATTACHMENTS} files · {MAX_ATTACHMENT_MB}MB
                        each
                      </span>
                    </button>

                    {attachmentError && (
                      <p className="text-[11px] text-red-500">
                        {attachmentError}
                      </p>
                    )}

                    {attachments.length > 0 && (
                      <ul className="space-y-1.5">
                        {attachments.map((a, i) => (
                          <li
                            key={`${a.name}-${i}`}
                            className="flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-[11px]"
                            style={{ borderColor: `${INK}15` }}
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
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
                                <p className="text-[10px] text-[#8FA69E]">
                                  {formatFileSize(a.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(i)}
                              className="shrink-0 rounded p-0.5 transition hover:bg-red-50"
                              style={{ color: "#B3261E" }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {activeSection === "comments" && (
                  <div className="space-y-4">
                    <SectionHeading
                      icon={<MessageSquare size={14} />}
                      title="Comments"
                      hint="ITask.comments"
                    />

                    <div>
                      <FieldLabel
                        icon={
                          <MessageSquare size={13} className="text-[#0F8A65]" />
                        }
                        optional
                      >
                        Opening comment
                      </FieldLabel>
                      <textarea
                        value={initialComment}
                        onChange={(e) => setInitialComment(e.target.value)}
                        maxLength={500}
                        rows={5}
                        placeholder="Leave context for whoever picks this up..."
                        className={`${inputClass} resize-none rounded-lg`}
                      />
                      <p className="mt-1 text-[10.5px] text-[#8FA69E]">
                        Posted as you, right after the task is created. Further
                        comments can be added from the task detail view.
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === "advanced" && (
                  <div className="space-y-4">
                    <SectionHeading
                      icon={<Archive size={14} />}
                      title="Advanced"
                      hint="ITask.isArchived, ITask.createdAt, ITask.updatedAt"
                    />

                    <div>
                      <button
                        type="button"
                        onClick={() => setIsArchived((v) => !v)}
                        className="flex w-full items-center justify-between rounded-lg border px-3.5 py-3 text-left transition"
                        style={{
                          borderColor: isArchived ? "#B3261E33" : `${INK}15`,
                          backgroundColor: isArchived ? "#FBEAE9" : "#FAFAF7",
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Archive
                            size={14}
                            style={{
                              color: isArchived ? "#B3261E" : "#5B6E68",
                            }}
                          />
                          <span
                            className="text-[12.5px] font-semibold"
                            style={{ color: isArchived ? "#B3261E" : INK }}
                          >
                            Create as archived
                          </span>
                        </span>
                        <span
                          className="flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition"
                          style={{
                            backgroundColor: isArchived ? "#B3261E" : "#D6D2C4",
                            justifyContent: isArchived
                              ? "flex-end"
                              : "flex-start",
                          }}
                        >
                          <span className="h-4 w-4 rounded-full bg-white shadow" />
                        </span>
                      </button>
                      <p className="mt-1 text-[10.5px] text-[#8FA69E]">
                        Archived tasks stay out of active boards and reports.
                        Almost always left off for a brand new task.
                      </p>
                    </div>

                    <div
                      className="flex items-start gap-2 rounded-lg border px-3.5 py-3 text-[11.5px]"
                      style={{
                        borderColor: `${INK}15`,
                        backgroundColor: "#FAFAF7",
                        color: `${INK}88`,
                      }}
                    >
                      <Info size={14} className="mt-0.5 shrink-0" />
                      <span>
                        <strong style={{ color: INK }}>createdAt</strong> and{" "}
                        <strong style={{ color: INK }}>updatedAt</strong> are
                        stamped automatically by the database the moment this
                        task is saved — there's nothing to fill in here.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ================= FOOTER (fixed, full width, inside form) ================= */}
            <div className="shrink-0 space-y-3 border-t border-[#0F2D29]/10 bg-white px-7 py-4 shadow-[0_-2px_6px_rgba(15,45,41,0.04)]">
              <div
                className="flex items-center gap-2.5 rounded-lg border p-3"
                style={{ borderColor: `${INK}12`, backgroundColor: accentSoft }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[9px] font-bold"
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
                  {selectedBoard && (
                    <>
                      on{" "}
                      <span className="font-bold" style={{ color: accent }}>
                        {selectedBoard.name}
                      </span>{" "}
                    </>
                  )}
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
                  {attachments.length > 0 && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-bold" style={{ color: accent }}>
                        {attachments.length} file
                        {attachments.length > 1 ? "s" : ""}
                      </span>{" "}
                      attached
                    </>
                  )}
                  {isArchived && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-bold" style={{ color: "#B3261E" }}>
                        archived
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex justify-end gap-2.5">
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
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
