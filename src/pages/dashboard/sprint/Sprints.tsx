import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import { useCreateSprint } from "@/hooks/mutations/project/use-create-sprint";
import { useUpdateSprint } from "@/hooks/mutations/sprint/use-update-sprint";
import { useDeleteSprint } from "@/hooks/mutations/sprint/use-delete-sprint";
import { useStartSprint } from "@/hooks/mutations/sprint/use-start-sprint";
import { useCompleteSprint } from "@/hooks/mutations/sprint/use-complete-sprint";
import { useGetProjectSprints } from "@/hooks/queries/project/use-get-project-sprints";
import { useSyncedWorkspace } from "@/hooks/useSyncedWorkspace";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useGetWorkspaceGoals } from "@/hooks/queries/goal/get-workspace-goals";
import {
  Plus,
  MoreHorizontal,
  Target,
  CalendarDays,
  KanbanSquare,
  ChevronDown,
  Search,
  Rocket,
  Clock,
  CheckCircle2,
  ListChecks,
  X,
  Check,
  FolderKanban,
  Inbox,
  AlertTriangle,
  Loader2,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";

const INK = "#0F2D29";
const MINT = "#8FE3C4";
const TEAL = "#0F8A65";

const STATUS_COLUMNS = ["planned", "active", "completed"] as const;
type SprintStatus = (typeof STATUS_COLUMNS)[number];

const STATUS_META: Record<
  SprintStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: typeof Rocket;
    empty: string;
  }
> = {
  planned: {
    label: "Planned",
    color: "#C2680B",
    bg: "#FDF1E4",
    icon: Clock,
    empty: "No sprints planned yet",
  },

  active: {
    label: "Active",
    color: TEAL,
    bg: "#E7F5EF",
    icon: Rocket,
    empty: "Nothing running right now",
  },

  completed: {
    label: "Completed",
    color: "#2563EB",
    bg: "#EAF0FE",
    icon: CheckCircle2,
    empty: "Nothing wrapped up yet",
  },
};

interface ApiWorkspace {
  _id: string;
  name: string;
}

interface ApiProject {
  _id: string;
  name: string;
}

interface ApiGoal {
  _id: string;
  title: string;
}

// Shape of a sprint as returned by GET /project-sprints. Written defensively
// since exact backend field names (id vs _id, taskCount vs tasksCount, etc.)
// can vary — every field is optional except what we can't sanely default
// (name, startDate, endDate).
interface ApiSprint {
  _id?: string;
  id?: string;
  name: string;
  status?: string;
  startDate: string;
  endDate: string;
  goal?: { _id: string; title: string } | string | null;
  goalTitle?: string;
  project?: { _id: string; name: string } | string | null;
  projectName?: string;
  taskCount?: number;
  tasksCount?: number;
  taskDone?: number;
  tasksDone?: number;
  completedTasks?: number;
  owner?: { name?: string } | null;
  ownerInitials?: string;
}

function normalizeListResponse<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && Array.isArray((raw as any).data)) {
    return (raw as any).data as T[];
  }
  return [];
}

function getFieldErrors(error: unknown): Record<string, string> {
  const errors = (error as any)?.response?.data?.errors;
  if (!Array.isArray(errors)) return {};
  return errors.reduce((acc: Record<string, string>, err: any) => {
    if (err?.field && err?.message) acc[err.field] = err.message;
    return acc;
  }, {});
}

function normalizeStatus(raw: unknown): SprintStatus {
  const value = typeof raw === "string" ? raw.toLowerCase() : "";
  return (STATUS_COLUMNS as readonly string[]).includes(value)
    ? (value as SprintStatus)
    : "planned";
}

function getInitials(name?: string): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "—";
}

// The API returns full ISO datetime strings (e.g. "2026-08-14T00:00:00.000Z"),
// but <input type="date"> only accepts "YYYY-MM-DD". Without this conversion
// the Edit Sprint modal renders with blank Start/End Date fields even though
// the sprint has valid dates.
function toDateInputValue(iso: string | undefined | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

// Maps a raw sprint record from the API into the shape the board renders.
function mapApiSprintToSprint(api: ApiSprint): Sprint {
  const goal = typeof api.goal === "object" && api.goal ? api.goal : undefined;
  const project =
    typeof api.project === "object" && api.project ? api.project : undefined;

  return {
    id: api._id ?? api.id ?? `sprint-${Math.random().toString(36).slice(2)}`,
    name: api.name,
    project:
      project?.name ??
      api.projectName ??
      (typeof api.project === "string" ? api.project : "Unassigned"),
    goalTitle: api.goalTitle ?? goal?.title,
    ownerInitials: api.ownerInitials ?? getInitials(api.owner?.name),
    // Normalized to "YYYY-MM-DD" so date inputs, formatting, and timing
    // calculations all work off a consistent value throughout the app.
    startDate: toDateInputValue(api.startDate) || api.startDate,
    endDate: toDateInputValue(api.endDate) || api.endDate,
    status: normalizeStatus(api.status),
    taskCount: api.taskCount ?? api.tasksCount ?? 0,
    taskDone: api.taskDone ?? api.tasksDone ?? api.completedTasks ?? 0,
  };
}

interface Sprint {
  id: string;
  name: string;
  project: string;
  goalTitle?: string;
  ownerInitials: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  taskCount: number;
  taskDone: number;
}

const TODAY = new Date("2026-08-11");

const EMPTY_SPRINTS: Record<SprintStatus, Sprint[]> = {
  planned: [],
  active: [],
  completed: [],
};

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function getTiming(
  sprint: Sprint,
): { label: string; tone: "warn" | "ok" | "muted" } | null {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);

  if (sprint.status === "completed") return null;

  if (sprint.status === "planned") {
    const d = daysBetween(TODAY, start);
    return {
      label: d <= 0 ? "Starting today" : `Starts in ${d}d`,
      tone: "muted",
    };
  }

  const d = daysBetween(TODAY, end);
  if (d < 0) return { label: `Overdue by ${Math.abs(d)}d`, tone: "warn" };
  if (d === 0) return { label: "Ends today", tone: "warn" };
  return { label: `${d}d left`, tone: "ok" };
}

const TIMING_COLORS: Record<
  "warn" | "ok" | "muted",
  { color: string; bg: string }
> = {
  warn: { color: "#B3261E", bg: "#FBEAE9" },
  ok: { color: TEAL, bg: "#E7F5EF" },
  muted: { color: `${INK}88`, bg: "#EDEBE3" },
};

function SprintCard({
  sprint,
  onEdit,
  onDelete,
  onStart,
  onComplete,
}: {
  sprint: Sprint;
  onEdit: (sprint: Sprint) => void;
  onDelete: (sprint: Sprint) => void;
  onStart?: (sprint: Sprint) => void;
  onComplete?: (sprint: Sprint) => void;
}) {
  const status = STATUS_META[sprint.status];
  const timing = getTiming(sprint);
  const goalTitle = sprint.goalTitle;
  const progress =
    sprint.taskCount > 0
      ? Math.round((sprint.taskDone / sprint.taskCount) * 100)
      : 0;

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="cursor-pointer border bg-white transition-shadow hover:shadow-md"
      style={{
        borderColor: `${INK}22`,
        borderLeft: `4px solid ${status.color}`,
      }}
      onClick={() => menuOpen && setMenuOpen(false)}
    >
      <div className="p-3.5">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: TEAL, backgroundColor: "#E7F5EF" }}
            >
              <FolderKanban size={10} />
              {sprint.project}
            </span>
            {goalTitle && (
              <span
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ color: "#6A4EE0", backgroundColor: "#EFEBFC" }}
              >
                <Target size={10} />
                {goalTitle}
              </span>
            )}
          </div>

          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="flex h-6 w-6 items-center justify-center"
              style={{ color: `${INK}66` }}
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full z-10 mt-1 w-32 border bg-white py-1 shadow-lg"
                style={{ borderColor: `${INK}22` }}
                onClick={(e) => e.stopPropagation()}
              >
                {sprint.status === "planned" && onStart && (
                  <button
                    onClick={() => {
                      onStart(sprint);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#E7F5EF]"
                    style={{ color: TEAL }}
                  >
                    <Rocket size={12} />
                    Start
                  </button>
                )}
                {sprint.status === "active" && onComplete && (
                  <button
                    onClick={() => {
                      onComplete(sprint);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#EAF0FE]"
                    style={{ color: "#2563EB" }}
                  >
                    <CheckCircle2 size={12} />
                    Complete
                  </button>
                )}
                <button
                  onClick={() => {
                    onEdit(sprint);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#EDEBE3]"
                  style={{ color: INK }}
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(sprint);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#FBEAE9]"
                  style={{ color: "#B3261E" }}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <p
          className="mb-3 text-sm font-bold leading-snug"
          style={{ color: INK }}
        >
          {sprint.name}
        </p>

        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span
            className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: status.color, backgroundColor: status.bg }}
          >
            {status.label}
          </span>
          {timing && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{
                color: TIMING_COLORS[timing.tone].color,
                backgroundColor: TIMING_COLORS[timing.tone].bg,
              }}
            >
              {timing.tone === "warn" && <AlertTriangle size={10} />}
              {timing.label}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span
            className="flex items-center gap-1 text-[11px] font-medium"
            style={{ color: `${INK}77` }}
          >
            <CalendarDays size={11} />
            {formatDateShort(sprint.startDate)} –{" "}
            {formatDateShort(sprint.endDate)}
          </span>
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center text-[9px] font-bold"
            style={{ backgroundColor: MINT, color: INK }}
          >
            {sprint.ownerInitials}
          </div>
        </div>
      </div>

      <div
        className="border-t px-3.5 py-2.5"
        style={{ borderColor: `${INK}15`, backgroundColor: "#FAFAF7" }}
      >
        <div
          className="mb-1.5 flex items-center justify-between text-[11px] font-semibold"
          style={{ color: `${INK}88` }}
        >
          <span className="flex items-center gap-1">
            <ListChecks size={11} />
            {sprint.taskDone}/{sprint.taskCount} tasks
          </span>
          <span style={{ color: INK }}>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#EDEBE3]">
          <div
            className="h-1.5 transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: sprint.status === "completed" ? "#2563EB" : TEAL,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function StatusColumn({
  status,
  sprints,
  onAddSprint,
  onEditSprint,
  onDeleteSprint,
  onStartSprint,
  onCompleteSprint,
}: {
  status: SprintStatus;
  sprints: Sprint[];
  onAddSprint: (status: SprintStatus) => void;
  onEditSprint: (sprint: Sprint) => void;
  onDeleteSprint: (sprint: Sprint) => void;
  onStartSprint?: (sprint: Sprint) => void;
  onCompleteSprint?: (sprint: Sprint) => void;
}) {
  const meta = STATUS_META[status];
  const EmptyIcon = meta.icon;

  return (
    <div className="flex max-h-full w-72 shrink-0 flex-col">
      <div className="h-0.75 w-full" style={{ backgroundColor: meta.color }} />
      <div className="flex items-center justify-between px-0.5 py-3">
        <span
          className="flex items-center gap-2 text-sm font-black"
          style={{ color: INK }}
        >
          <meta.icon size={13} style={{ color: meta.color }} />
          {meta.label}
          <span
            className="flex h-5 w-5 items-center justify-center text-[11px] font-bold"
            style={{ backgroundColor: "#EDEBE3", color: `${INK}99` }}
          >
            {sprints.length}
          </span>
        </span>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto pb-2 pr-1">
        {sprints.map((sprint) => (
          <SprintCard
            key={sprint.id}
            sprint={sprint}
            onEdit={onEditSprint}
            onDelete={onDeleteSprint}
            onStart={onStartSprint}
            onComplete={onCompleteSprint}
          />
        ))}

        {sprints.length === 0 && (
          <div
            className="flex flex-col items-center gap-2 border border-dashed py-8 text-center"
            style={{ borderColor: `${INK}22` }}
          >
            <EmptyIcon size={18} style={{ color: `${INK}44` }} />
            <p
              className="text-[11px] font-medium"
              style={{ color: `${INK}55` }}
            >
              {meta.empty}
            </p>
          </div>
        )}

        <button
          onClick={() => onAddSprint(status)}
          className="flex w-full items-center justify-center gap-1.5 border border-dashed py-2.5 text-xs font-bold"
          style={{ borderColor: `${INK}33`, color: `${INK}77` }}
        >
          <Plus size={13} />
          Add Sprint
        </button>
      </div>
    </div>
  );
}

function CreateSprintModal({
  defaultStatus,
  defaultWorkspaceId,
  defaultProjectId,
  isSubmitting,
  errorMessage,
  fieldErrors,
  onClose,
  onCreate,
}: {
  defaultStatus: SprintStatus;
  defaultWorkspaceId?: string;
  defaultProjectId?: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  fieldErrors: Record<string, string>;
  onClose: () => void;
  onCreate: (sprint: {
    name: string;
    workspaceId: string;
    projectId: string;
    projectName: string;
    goalId: string;
    goalTitle?: string;
    status: SprintStatus;
    startDate: string;
    endDate: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [workspaceId, setWorkspaceId] = useState(defaultWorkspaceId ?? "");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [goalId, setGoalId] = useState("");
  const [status, setStatus] = useState<SprintStatus>(defaultStatus);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dateOrderError =
    startDate && endDate && new Date(endDate) <= new Date(startDate)
      ? "End date must be after start date."
      : null;

  const { data: workspacesRes, isLoading: isLoadingWorkspaces } =
    useGetUserWorkspaces();
  const workspaces = useMemo(
    () => normalizeListResponse<ApiWorkspace>(workspacesRes),
    [workspacesRes],
  );

  const { data: projectsRes, isLoading: isLoadingProjects } =
    useGetWorkspaceProjects(workspaceId);
  const availableProjects = useMemo(
    () => normalizeListResponse<ApiProject>(projectsRes),
    [projectsRes],
  );

  const { data: goalsRes, isLoading: isLoadingGoals } =
    useGetWorkspaceGoals(workspaceId);
  const availableGoals = useMemo(
    () => normalizeListResponse<ApiGoal>(goalsRes),
    [goalsRes],
  );

  const handleWorkspaceChange = (nextWorkspaceId: string) => {
    setWorkspaceId(nextWorkspaceId);
    setProjectId("");
    setGoalId("");
  };

  const canCreate =
    name.trim().length > 0 &&
    workspaceId.trim().length > 0 &&
    projectId.trim().length > 0 &&
    startDate &&
    endDate &&
    !dateOrderError &&
    !isSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="w-full max-w-lg border bg-white shadow-2xl"
        style={{ borderColor: `${INK}22` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between gap-4 px-6 py-5"
          style={{ backgroundColor: INK }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ backgroundColor: TEAL }}
            >
              <Rocket size={18} color="white" />
            </div>
            <div>
              <p className="text-base font-black leading-none text-white">
                Create New Sprint
              </p>
              <p
                className="mt-1 text-xs font-medium"
                style={{ color: `${MINT}CC` }}
              >
                Plan a timeboxed cycle of work for this project.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="shrink-0 text-white/70 hover:text-white disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          {errorMessage && (
            <div
              className="flex items-start gap-2 border px-3 py-2.5 text-xs font-semibold"
              style={{
                borderColor: "#F3B8B4",
                backgroundColor: "#FBEAE9",
                color: "#B3261E",
              }}
            >
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div>
            <label
              className="mb-1.5 block text-xs font-bold"
              style={{ color: INK }}
            >
              Sprint Name <span style={{ color: "#B3261E" }}>*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sprint 16 — Notification Center"
              disabled={isSubmitting}
              className="w-full border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65] disabled:opacity-60"
              style={{ borderColor: `${INK}22`, color: INK }}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-bold"
              style={{ color: INK }}
            >
              Workspace <span style={{ color: "#B3261E" }}>*</span>
            </label>
            <select
              value={workspaceId}
              onChange={(e) => handleWorkspaceChange(e.target.value)}
              disabled={isSubmitting || isLoadingWorkspaces}
              className="w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65] disabled:opacity-60"
              style={{ borderColor: `${INK}22`, color: INK }}
            >
              <option value="">
                {isLoadingWorkspaces
                  ? "Loading workspaces..."
                  : "Select a workspace"}
              </option>
              {workspaces.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="mb-1.5 block text-xs font-bold"
                style={{ color: INK }}
              >
                Project <span style={{ color: "#B3261E" }}>*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={isSubmitting || !workspaceId || isLoadingProjects}
                className="w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65] disabled:opacity-60"
                style={{ borderColor: `${INK}22`, color: INK }}
              >
                <option value="">
                  {!workspaceId
                    ? "Select a workspace first"
                    : isLoadingProjects
                      ? "Loading projects..."
                      : availableProjects.length === 0
                        ? "No projects"
                        : "Select a project"}
                </option>
                {availableProjects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold"
                style={{ color: INK }}
              >
                Goal{" "}
                <span className="font-medium" style={{ color: `${INK}55` }}>
                  (optional)
                </span>
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                disabled={isSubmitting || !workspaceId || isLoadingGoals}
                className="w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65] disabled:opacity-60"
                style={{ borderColor: `${INK}22`, color: INK }}
              >
                <option value="">
                  {!workspaceId
                    ? "Select a workspace first"
                    : isLoadingGoals
                      ? "Loading goals..."
                      : "No goal"}
                </option>
                {availableGoals.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.title}
                  </option>
                ))}
              </select>
              {(fieldErrors.goal || fieldErrors.goalId) && (
                <p
                  className="mt-1 text-[11px] font-semibold"
                  style={{ color: "#B3261E" }}
                >
                  {fieldErrors.goal || fieldErrors.goalId}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              className="mb-1.5 flex items-center gap-1.5 text-xs font-bold"
              style={{ color: INK }}
            >
              <KanbanSquare size={13} />
              Status
            </label>
            <div className="flex gap-2">
              {STATUS_COLUMNS.map((s) => {
                const meta = STATUS_META[s];
                const selected = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    disabled={isSubmitting}
                    className="flex flex-1 flex-col items-center gap-1.5 border py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors disabled:opacity-60"
                    style={{
                      borderColor: selected ? meta.color : `${INK}22`,
                      backgroundColor: selected ? meta.bg : "white",
                      color: selected ? meta.color : `${INK}77`,
                    }}
                  >
                    <meta.icon size={15} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="mb-1.5 block text-xs font-bold"
                style={{ color: INK }}
              >
                Start Date <span style={{ color: "#B3261E" }}>*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65] disabled:opacity-60"
                style={{ borderColor: `${INK}22`, color: INK }}
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-bold"
                style={{ color: INK }}
              >
                End Date <span style={{ color: "#B3261E" }}>*</span>
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65] disabled:opacity-60"
                style={{ borderColor: `${INK}22`, color: INK }}
              />
              {(dateOrderError || fieldErrors.endDate) && (
                <p
                  className="mt-1 text-[11px] font-semibold"
                  style={{ color: "#B3261E" }}
                >
                  {dateOrderError || fieldErrors.endDate}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-3 border-t px-6 py-4"
          style={{ borderColor: `${INK}15`, backgroundColor: "#FAFAF7" }}
        >
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold disabled:opacity-40"
            style={{ color: `${INK}88` }}
          >
            Cancel
          </button>
          <button
            onClick={() =>
              canCreate &&
              onCreate({
                name: name.trim(),
                workspaceId,
                projectId,
                projectName:
                  availableProjects.find((p) => p._id === projectId)?.name ??
                  "Unassigned",
                goalId,
                goalTitle: availableGoals.find((g) => g._id === goalId)?.title,
                status,
                startDate,
                endDate,
              })
            }
            disabled={!canCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: INK }}
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Plus size={13} />
            )}
            {isSubmitting ? "Creating..." : "Create Sprint"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditSprintModal({
  sprint,
  isSubmitting,
  errorMessage,
  fieldErrors,
  onClose,
  onSave,
}: {
  sprint: Sprint;
  isSubmitting: boolean;
  errorMessage: string | null;
  fieldErrors: Record<string, string>;
  onClose: () => void;
  onSave: (data: {
    name: string;
    status: SprintStatus;
    startDate: string;
    endDate: string;
  }) => void;
}) {
  const [name, setName] = useState(sprint.name);
  const [status, setStatus] = useState<SprintStatus>(sprint.status);
  // sprint.startDate / sprint.endDate are normalized to "YYYY-MM-DD" in
  // mapApiSprintToSprint, but toDateInputValue is applied again here as a
  // defensive guard in case a full ISO string ever slips through (e.g. an
  // optimistic update elsewhere in the app).
  const [startDate, setStartDate] = useState(
    toDateInputValue(sprint.startDate) || sprint.startDate,
  );
  const [endDate, setEndDate] = useState(
    toDateInputValue(sprint.endDate) || sprint.endDate,
  );

  const dateOrderError =
    startDate && endDate && new Date(endDate) <= new Date(startDate)
      ? "End date must be after start date."
      : null;

  const canSave =
    name.trim().length > 0 &&
    startDate &&
    endDate &&
    !dateOrderError &&
    !isSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="w-full max-w-lg border bg-white shadow-2xl"
        style={{ borderColor: `${INK}22` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between gap-4 px-6 py-5"
          style={{ backgroundColor: INK }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ backgroundColor: TEAL }}
            >
              <Pencil size={16} color="white" />
            </div>
            <div>
              <p className="text-base font-black leading-none text-white">
                Edit Sprint
              </p>
              <p
                className="mt-1 text-xs font-medium"
                style={{ color: `${MINT}CC` }}
              >
                Update the name, timeline, or status.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="shrink-0 text-white/70 hover:text-white disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          {errorMessage && (
            <div
              className="flex items-start gap-2 border px-3 py-2.5 text-xs font-semibold"
              style={{
                borderColor: "#F3B8B4",
                backgroundColor: "#FBEAE9",
                color: "#B3261E",
              }}
            >
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div>
            <label
              className="mb-1.5 block text-xs font-bold"
              style={{ color: INK }}
            >
              Sprint Name <span style={{ color: "#B3261E" }}>*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="w-full border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65] disabled:opacity-60"
              style={{ borderColor: `${INK}22`, color: INK }}
            />
            {fieldErrors.name && (
              <p
                className="mt-1 text-[11px] font-semibold"
                style={{ color: "#B3261E" }}
              >
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              className="mb-1.5 flex items-center gap-1.5 text-xs font-bold"
              style={{ color: INK }}
            >
              <KanbanSquare size={13} />
              Status
            </label>
            <div className="flex gap-2">
              {STATUS_COLUMNS.map((s) => {
                const meta = STATUS_META[s];
                const selected = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    disabled={isSubmitting}
                    className="flex flex-1 flex-col items-center gap-1.5 border py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors disabled:opacity-60"
                    style={{
                      borderColor: selected ? meta.color : `${INK}22`,
                      backgroundColor: selected ? meta.bg : "white",
                      color: selected ? meta.color : `${INK}77`,
                    }}
                  >
                    <meta.icon size={15} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="mb-1.5 block text-xs font-bold"
                style={{ color: INK }}
              >
                Start Date <span style={{ color: "#B3261E" }}>*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65] disabled:opacity-60"
                style={{ borderColor: `${INK}22`, color: INK }}
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-bold"
                style={{ color: INK }}
              >
                End Date <span style={{ color: "#B3261E" }}>*</span>
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65] disabled:opacity-60"
                style={{ borderColor: `${INK}22`, color: INK }}
              />
              {(dateOrderError || fieldErrors.endDate) && (
                <p
                  className="mt-1 text-[11px] font-semibold"
                  style={{ color: "#B3261E" }}
                >
                  {dateOrderError || fieldErrors.endDate}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-3 border-t px-6 py-4"
          style={{ borderColor: `${INK}15`, backgroundColor: "#FAFAF7" }}
        >
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold disabled:opacity-40"
            style={{ color: `${INK}88` }}
          >
            Cancel
          </button>
          <button
            onClick={() =>
              canSave &&
              onSave({ name: name.trim(), status, startDate, endDate })
            }
            disabled={!canSave}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: INK }}
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteSprintModal({
  sprint,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: {
  sprint: Sprint;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="w-full max-w-sm border bg-white shadow-2xl"
        style={{ borderColor: `${INK}22` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 px-6 pt-6">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center"
            style={{ backgroundColor: "#FBEAE9" }}
          >
            <Trash2 size={17} style={{ color: "#B3261E" }} />
          </div>
          <div>
            <p className="text-sm font-black" style={{ color: INK }}>
              Delete this sprint?
            </p>
            <p
              className="mt-1 text-xs font-medium"
              style={{ color: `${INK}77` }}
            >
              "{sprint.name}" will be permanently removed. This can't be undone.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            className="mx-6 mt-4 flex items-start gap-2 border px-3 py-2.5 text-xs font-semibold"
            style={{
              borderColor: "#F3B8B4",
              backgroundColor: "#FBEAE9",
              color: "#B3261E",
            }}
          >
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-6 py-5">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold disabled:opacity-40"
            style={{ color: `${INK}88` }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: "#B3261E" }}
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            {isSubmitting ? "Deleting..." : "Delete Sprint"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const Sprints = () => {
  const { openMobileNav } = useDashboardContext();

  // Adjust this param name if your route defines the project id differently
  // (e.g. /projects/:id instead of /projects/:projectId).
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();

  const [sprintsByStatus, setSprintsByStatus] =
    useState<Record<SprintStatus, Sprint[]>>(EMPTY_SPRINTS);

  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SprintStatus | "all">("all");

  const [addSprintDefaultStatus, setAddSprintDefaultStatus] =
    useState<SprintStatus | null>(null);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [deletingSprint, setDeletingSprint] = useState<Sprint | null>(null);

  // ── Workspace / Project switcher (mirrors the board-switcher pattern in
  // Board.tsx: fetch the user's workspaces, fetch that workspace's projects,
  // default-select based on the route param, and let the user switch freely
  // from the toolbar). This drives which project's sprints are loaded below.
  const {
    workspaces: syncedWorkspaces,
    currentWorkspaceId: selectedWorkspaceId,
    setCurrentWorkspaceId: setSelectedWorkspaceId,
    isLoadingWorkspaces,
  } = useSyncedWorkspace();
  const [selectedProjectId, setSelectedProjectId] = useState(
    routeProjectId ?? "",
  );

  const workspaces = useMemo(
    () =>
      syncedWorkspaces.map((workspace: { id?: string; _id?: string; name?: string }) => ({
        _id: workspace._id ?? workspace.id,
        name: workspace.name,
      })),
    [syncedWorkspaces],
  );

  const { data: workspaceProjectsRes, isLoading: isLoadingWorkspaceProjects } =
    useGetWorkspaceProjects(selectedWorkspaceId);
  const projectsInWorkspace = useMemo(
    () => normalizeListResponse<ApiProject>(workspaceProjectsRes),
    [workspaceProjectsRes],
  );

  // Default project within the selected workspace: prefer the route's
  // projectId if it belongs to this workspace, otherwise keep the current
  // selection if still valid, otherwise fall back to the first project.
  useEffect(() => {
    if (!projectsInWorkspace.length) return;
    if (
      selectedProjectId &&
      projectsInWorkspace.some((p) => p._id === selectedProjectId)
    ) {
      return;
    }
    const matched = projectsInWorkspace.find((p) => p._id === routeProjectId);
    setSelectedProjectId(matched?._id ?? projectsInWorkspace[0]._id);
  }, [projectsInWorkspace, routeProjectId, selectedProjectId]);

  const handleWorkspaceSwitch = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setSelectedProjectId("");
  };

  const selectedProjectName =
    projectsInWorkspace.find((p) => p._id === selectedProjectId)?.name ??
    "Project";

  const {
    data: projectSprintsRes,
    isLoading: isLoadingSprints,
    isError: isSprintsError,
    error: sprintsErrorObj,
    refetch: refetchSprints,
    isFetching: isRefetchingSprints,
  } = useGetProjectSprints(selectedProjectId);

  const sprintsError = sprintsErrorObj
    ? (sprintsErrorObj as any)?.response?.data?.message ||
      "Couldn't load sprints for this project."
    : null;

  // Keep the board in sync with the server data every time the query
  // resolves (initial load, refetch after invalidation, manual retry, or
  // switching to a different project).
  useEffect(() => {
    if (!projectSprintsRes) return;
    const fetchedSprints =
      normalizeListResponse<ApiSprint>(projectSprintsRes).map(
        mapApiSprintToSprint,
      );

    const grouped: Record<SprintStatus, Sprint[]> = {
      planned: [],
      active: [],
      completed: [],
    };
    fetchedSprints.forEach((sprint) => {
      grouped[sprint.status].push(sprint);
    });
    setSprintsByStatus(grouped);
  }, [projectSprintsRes]);

  const {
    mutate: createSprint,
    isPending: isCreatingSprint,
    error: createSprintErrorObj,
    reset: resetCreateSprintError,
  } = useCreateSprint();

  const {
    mutate: updateSprint,
    isPending: isUpdatingSprint,
    error: updateSprintErrorObj,
    reset: resetUpdateSprintError,
  } = useUpdateSprint();

  const {
    mutate: deleteSprint,
    isPending: isDeletingSprint,
    error: deleteSprintErrorObj,
    reset: resetDeleteSprintError,
  } = useDeleteSprint();

  const { mutate: startSprintMutation } = useStartSprint();
  const { mutate: completeSprintMutation } = useCompleteSprint();

  const createSprintError = createSprintErrorObj
    ? (createSprintErrorObj as any)?.response?.data?.message ||
      "Couldn't create the sprint. Please try again."
    : null;

  const createSprintFieldErrors = useMemo(
    () => getFieldErrors(createSprintErrorObj),
    [createSprintErrorObj],
  );

  const updateSprintError = updateSprintErrorObj
    ? (updateSprintErrorObj as any)?.response?.data?.message ||
      "Couldn't update the sprint. Please try again."
    : null;

  const updateSprintFieldErrors = useMemo(
    () => getFieldErrors(updateSprintErrorObj),
    [updateSprintErrorObj],
  );

  const deleteSprintError = deleteSprintErrorObj
    ? (deleteSprintErrorObj as any)?.response?.data?.message ||
      "Couldn't delete the sprint. Please try again."
    : null;

  const allSprints = Object.values(sprintsByStatus).flat();
  const totalSprints = allSprints.length;
  const activeSprints = sprintsByStatus.active.length;
  const completedSprints = sprintsByStatus.completed.length;
  const totalTasksTracked = allSprints.reduce((sum, s) => sum + s.taskCount, 0);

  const projects = useMemo(
    () => Array.from(new Set(allSprints.map((s) => s.project))),
    [allSprints],
  );

  const metricCards = [
    {
      title: "Total Sprints",
      value: totalSprints,
      subtitle: "Across this project",
      icon: Rocket,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "Active Now",
      value: activeSprints,
      subtitle: "Currently running",
      icon: Clock,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Completed",
      value: completedSprints,
      subtitle: "Wrapped up sprints",
      icon: CheckCircle2,
      accentColor: "#2563EB",
      bgGradient: "from-[#2563EB]/10 to-transparent",
    },
    {
      title: "Tasks Tracked",
      value: totalTasksTracked,
      subtitle: "Linked across sprints",
      icon: ListChecks,
      accentColor: "#D97706",
      bgGradient: "from-[#D97706]/10 to-transparent",
    },
  ];

  const handleCreateSprint = (data: {
    name: string;
    workspaceId: string;
    projectId: string;
    projectName: string;
    goalId: string;
    goalTitle?: string;
    status: SprintStatus;
    startDate: string;
    endDate: string;
  }) => {
    createSprint(
      {
        projectId: data.projectId,
        data: {
          name: data.name,
          ...(data.goalId ? { goalId: data.goalId } : {}),
          startDate: data.startDate,
          endDate: data.endDate,
        },
      },
      {
        onSuccess: (response: any) => {
          const created = response?.data ?? response;
          const newSprint: Sprint = {
            id: created?.id ?? `s${Date.now()}`,
            name: created?.name ?? data.name,
            project: data.projectName || "Unassigned",
            goalTitle: data.goalTitle,
            ownerInitials: created?.ownerInitials ?? "—",
            startDate: toDateInputValue(created?.startDate) || data.startDate,
            endDate: toDateInputValue(created?.endDate) || data.endDate,
            status: created?.status ?? data.status,
            taskCount: created?.taskCount ?? 0,
            taskDone: created?.taskDone ?? 0,
          };

          // If the sprint was created for the project currently on screen,
          // merge it locally so the board updates instantly. useCreateSprint
          // already invalidates ["project-sprints", data.projectId] and
          // ["project", data.projectId], so a background refetch will bring
          // in server truth regardless.
          if (data.projectId === selectedProjectId) {
            setSprintsByStatus((prev) => ({
              ...prev,
              [newSprint.status]: [...prev[newSprint.status], newSprint],
            }));
          }
          setAddSprintDefaultStatus(null);
        },
      },
    );
  };

  const handleUpdateSprint = (data: {
    name: string;
    status: SprintStatus;
    startDate: string;
    endDate: string;
  }) => {
    if (!editingSprint) return;

    updateSprint(
      {
        sprintId: editingSprint.id,
        data: {
          name: data.name,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      },
      {
        onSuccess: () => {
          // useUpdateSprint already invalidates ["sprint", id], ["project-sprints"]
          // and ["project"], but merge locally too so the board reflects the
          // change (including a possible column move) right away.
          setSprintsByStatus((prev) => {
            const next: Record<SprintStatus, Sprint[]> = {
              planned: prev.planned.filter((s) => s.id !== editingSprint.id),
              active: prev.active.filter((s) => s.id !== editingSprint.id),
              completed: prev.completed.filter(
                (s) => s.id !== editingSprint.id,
              ),
            };
            const updatedSprint: Sprint = {
              ...editingSprint,
              name: data.name,
              status: data.status,
              startDate: data.startDate,
              endDate: data.endDate,
            };
            next[data.status] = [...next[data.status], updatedSprint];
            return next;
          });
          setEditingSprint(null);
        },
      },
    );
  };

  const handleDeleteSprint = () => {
    if (!deletingSprint) return;

    deleteSprint(deletingSprint.id, {
      onSuccess: () => {
        setSprintsByStatus((prev) => ({
          ...prev,
          [deletingSprint.status]: prev[deletingSprint.status].filter(
            (s) => s.id !== deletingSprint.id,
          ),
        }));
        setDeletingSprint(null);
      },
    });
  };

  const filteredSprints = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result: Record<SprintStatus, Sprint[]> = {
      planned: [],
      active: [],
      completed: [],
    };
    for (const status of STATUS_COLUMNS) {
      result[status] = sprintsByStatus[status].filter((sprint) => {
        const matchesQuery = query
          ? sprint.name.toLowerCase().includes(query)
          : true;
        const matchesProject = projectFilter
          ? sprint.project === projectFilter
          : true;
        return matchesQuery && matchesProject;
      });
    }
    return result;
  }, [sprintsByStatus, searchQuery, projectFilter]);

  const visibleStatuses =
    statusFilter === "all" ? STATUS_COLUMNS : [statusFilter];

  return (
    <>
      <Topbar
        variant="light"
        title="Sprints"
        subtitle={`${selectedProjectName} · ${totalSprints} total sprint${totalSprints === 1 ? "" : "s"} · ${activeSprints} active`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col space-y-6 p-4 sm:p-6 lg:p-8">
        <DashboardMetricsBanner cards={metricCards} />

        <div className="flex flex-wrap items-center justify-between gap-3 border border-[#0F2D29]/15 bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: `${INK}55` }}
              />
              <input
                id="sprint-search-input"
                placeholder="Search sprints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 border bg-white py-2.5 pl-8 pr-3 text-xs outline-none"
                style={{ borderColor: `${INK}22`, color: INK }}
              />
            </div>

            {/* Workspace switcher — same pattern as Board.tsx's board switcher */}
            {workspaces.length > 1 && (
              <div className="relative">
                <select
                  value={selectedWorkspaceId}
                  onChange={(e) => handleWorkspaceSwitch(e.target.value)}
                  disabled={isLoadingWorkspaces}
                  className="appearance-none border bg-white py-2.5 pl-3 pr-7 text-xs font-bold outline-none disabled:opacity-60"
                  style={{ borderColor: `${INK}22`, color: INK }}
                >
                  {workspaces.map((w) => (
                    <option key={w._id} value={w._id ?? ""}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                  style={{ color: `${INK}77` }}
                />
              </div>
            )}

            {/* Project switcher — drives useGetProjectSprints below */}
            {projectsInWorkspace.length > 0 && (
              <div className="relative">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={isLoadingWorkspaceProjects}
                  className="appearance-none border bg-white py-2.5 pl-3 pr-7 text-xs font-bold outline-none disabled:opacity-60"
                  style={{ borderColor: `${INK}22`, color: INK }}
                >
                  {projectsInWorkspace.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                  style={{ color: `${INK}77` }}
                />
              </div>
            )}

            <div className="flex border" style={{ borderColor: `${INK}22` }}>
              {(["all", ...STATUS_COLUMNS] as const).map((s, i) => {
                const active = statusFilter === s;
                const label = s === "all" ? "All" : STATUS_META[s].label;
                const activeColor =
                  s === "all" ? INK : STATUS_META[s as SprintStatus].color;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="px-2.5 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors"
                    style={{
                      color: active ? "white" : `${INK}88`,
                      backgroundColor: active ? activeColor : "white",
                      borderLeft: i > 0 ? `1px solid ${INK}22` : "none",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilterMenu((v) => !v)}
                className="flex items-center gap-1.5 border bg-white px-3 py-2.5 text-xs font-bold"
                style={{
                  borderColor: projectFilter ? TEAL : `${INK}22`,
                  color: projectFilter ? TEAL : INK,
                }}
              >
                {projectFilter ? `Project: ${projectFilter}` : "Project"}
                <ChevronDown size={13} />
              </button>

              {showFilterMenu && (
                <div
                  className="absolute left-0 top-full z-10 mt-1.5 w-52 border bg-white py-1 shadow-lg"
                  style={{ borderColor: `${INK}22` }}
                >
                  <button
                    onClick={() => {
                      setProjectFilter(null);
                      setShowFilterMenu(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold hover:bg-[#EDEBE3]"
                    style={{ color: INK }}
                  >
                    All projects
                    {!projectFilter && <Check size={12} />}
                  </button>
                  {projects.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setProjectFilter(p);
                        setShowFilterMenu(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold hover:bg-[#EDEBE3]"
                      style={{ color: INK }}
                    >
                      {p}
                      {projectFilter === p && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span
              className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: TEAL, backgroundColor: "#E7F5EF" }}
            >
              <KanbanSquare size={11} />
              sprint board
            </span>

            {isRefetchingSprints && !isLoadingSprints && (
              <span
                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
                style={{ color: `${INK}66`, backgroundColor: "#EDEBE3" }}
              >
                <Loader2 size={11} className="animate-spin" />
                syncing
              </span>
            )}
          </div>

          <button
            onClick={() => setAddSprintDefaultStatus("planned")}
            disabled={!selectedProjectId}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: INK }}
          >
            <Plus size={13} />
            Add Sprint
          </button>
        </div>

        {!selectedProjectId ? (
          <div
            className="flex min-h-80 flex-col items-center justify-center gap-2 border border-dashed"
            style={{ borderColor: `${INK}22` }}
          >
            <FolderKanban size={22} style={{ color: `${INK}44` }} />
            <p className="text-xs font-semibold" style={{ color: `${INK}66` }}>
              Select a workspace and project to see its sprints
            </p>
          </div>
        ) : isLoadingSprints ? (
          <div
            className="flex min-h-80 flex-col items-center justify-center gap-2 border border-dashed"
            style={{ borderColor: `${INK}22` }}
          >
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: `${INK}55` }}
            />
            <p className="text-xs font-semibold" style={{ color: `${INK}66` }}>
              Loading sprints...
            </p>
          </div>
        ) : isSprintsError ? (
          <div
            className="flex min-h-80 flex-col items-center justify-center gap-3 border border-dashed"
            style={{ borderColor: "#F3B8B4", backgroundColor: "#FBEAE9" }}
          >
            <AlertTriangle size={20} style={{ color: "#B3261E" }} />
            <p className="text-xs font-semibold" style={{ color: "#B3261E" }}>
              {sprintsError}
            </p>
            <button
              onClick={() => refetchSprints()}
              className="flex items-center gap-1.5 border px-3 py-2 text-xs font-bold"
              style={{ borderColor: "#B3261E", color: "#B3261E" }}
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        ) : totalSprints === 0 ? (
          <div
            className="flex min-h-80 flex-col items-center justify-center gap-2 border border-dashed"
            style={{ borderColor: `${INK}22` }}
          >
            <Inbox size={22} style={{ color: `${INK}44` }} />
            <p className="text-xs font-semibold" style={{ color: `${INK}66` }}>
              No sprints yet — create your first one
            </p>
          </div>
        ) : (
          <div className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden pb-2">
            {visibleStatuses.map((status) => (
              <StatusColumn
                key={status}
                status={status}
                sprints={filteredSprints[status] || []}
                onAddSprint={(s) => setAddSprintDefaultStatus(s)}
                onEditSprint={(sprint) => setEditingSprint(sprint)}
                onDeleteSprint={(sprint) => setDeletingSprint(sprint)}
                onStartSprint={(sprint) => startSprintMutation(sprint.id)}
                onCompleteSprint={(sprint) => completeSprintMutation(sprint.id)}
              />
            ))}
          </div>
        )}
      </main>

      {addSprintDefaultStatus && (
        <CreateSprintModal
          defaultStatus={addSprintDefaultStatus}
          defaultWorkspaceId={selectedWorkspaceId}
          defaultProjectId={selectedProjectId}
          isSubmitting={isCreatingSprint}
          errorMessage={createSprintError}
          fieldErrors={createSprintFieldErrors}
          onClose={() => {
            if (isCreatingSprint) return;
            setAddSprintDefaultStatus(null);
            resetCreateSprintError();
          }}
          onCreate={handleCreateSprint}
        />
      )}

      {editingSprint && (
        <EditSprintModal
          sprint={editingSprint}
          isSubmitting={isUpdatingSprint}
          errorMessage={updateSprintError}
          fieldErrors={updateSprintFieldErrors}
          onClose={() => {
            if (isUpdatingSprint) return;
            setEditingSprint(null);
            resetUpdateSprintError();
          }}
          onSave={handleUpdateSprint}
        />
      )}

      {deletingSprint && (
        <DeleteSprintModal
          sprint={deletingSprint}
          isSubmitting={isDeletingSprint}
          errorMessage={deleteSprintError}
          onClose={() => {
            if (isDeletingSprint) return;
            setDeletingSprint(null);
            resetDeleteSprintError();
          }}
          onConfirm={handleDeleteSprint}
        />
      )}
    </>
  );
};

export default Sprints;
