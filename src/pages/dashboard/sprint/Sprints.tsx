import { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
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

interface Goal {
  id: string;
  title: string;
  project: string;
}

const GOALS: Goal[] = [
  { id: "g1", title: "Ship dark mode", project: "Aurora Design System" },
  {
    id: "g2",
    title: "Design token migration",
    project: "Aurora Design System",
  },
  {
    id: "g3",
    title: "Reduce bundle size 20%",
    project: "Aurora Design System",
  },
];

interface Sprint {
  id: string;
  name: string;
  project: string;
  goalId?: string;
  ownerInitials: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  taskCount: number;
  taskDone: number;
}

const TODAY = new Date("2026-08-11");

const initialSprints: Record<SprintStatus, Sprint[]> = {
  planned: [
    {
      id: "s1",
      name: "Sprint 14 — Theming Pass 2",
      project: "Aurora Design System",
      goalId: "g1",
      ownerInitials: "PY",
      startDate: "2026-08-18",
      endDate: "2026-08-29",
      status: "planned",
      taskCount: 0,
      taskDone: 0,
    },
    {
      id: "s2",
      name: "Sprint 15 — Accessibility Audit",
      project: "Aurora Design System",
      goalId: undefined,
      ownerInitials: "RK",
      startDate: "2026-09-01",
      endDate: "2026-09-12",
      status: "planned",
      taskCount: 0,
      taskDone: 0,
    },
  ],
  active: [
    {
      id: "s3",
      name: "Sprint 13 — Component Rollout",
      project: "Aurora Design System",
      goalId: "g1",
      ownerInitials: "PY",
      startDate: "2026-08-04",
      endDate: "2026-08-15",
      status: "active",
      taskCount: 12,
      taskDone: 7,
    },
  ],
  completed: [
    {
      id: "s4",
      name: "Sprint 12 — Token Foundations",
      project: "Aurora Design System",
      goalId: "g2",
      ownerInitials: "SN",
      startDate: "2026-07-21",
      endDate: "2026-08-01",
      status: "completed",
      taskCount: 9,
      taskDone: 9,
    },
    {
      id: "s5",
      name: "Sprint 11 — Storybook Setup",
      project: "Aurora Design System",
      goalId: undefined,
      ownerInitials: "RK",
      startDate: "2026-07-07",
      endDate: "2026-07-18",
      status: "completed",
      taskCount: 6,
      taskDone: 6,
    },
  ],
};

function getGoalTitle(goalId?: string) {
  if (!goalId) return undefined;
  return GOALS.find((g) => g.id === goalId)?.title;
}

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

function SprintCard({ sprint }: { sprint: Sprint }) {
  const status = STATUS_META[sprint.status];
  const timing = getTiming(sprint);
  const goalTitle = getGoalTitle(sprint.goalId);
  const progress =
    sprint.taskCount > 0
      ? Math.round((sprint.taskDone / sprint.taskCount) * 100)
      : 0;

  return (
    <div
      className="cursor-pointer border bg-white transition-shadow hover:shadow-md"
      style={{
        borderColor: `${INK}22`,
        borderLeft: `4px solid ${status.color}`,
      }}
    >
      <div className="p-3.5">
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
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
}: {
  status: SprintStatus;
  sprints: Sprint[];
  onAddSprint: (status: SprintStatus) => void;
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
        <button
          className="flex h-6 w-6 items-center justify-center"
          style={{ color: `${INK}66` }}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto pb-2 pr-1">
        {sprints.map((sprint) => (
          <SprintCard key={sprint.id} sprint={sprint} />
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
  projects,
  onClose,
  onCreate,
}: {
  defaultStatus: SprintStatus;
  projects: string[];
  onClose: () => void;
  onCreate: (sprint: {
    name: string;
    project: string;
    goalId: string;
    status: SprintStatus;
    startDate: string;
    endDate: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [project, setProject] = useState(projects[0] || "");
  const [goalId, setGoalId] = useState("");
  const [status, setStatus] = useState<SprintStatus>(defaultStatus);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const availableGoals = useMemo(
    () => GOALS.filter((g) => g.project === project),
    [project],
  );

  const canCreate =
    name.trim().length > 0 && project.trim().length > 0 && startDate && endDate;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
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
            className="shrink-0 text-white/70 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
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
              className="w-full border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
              style={{ borderColor: `${INK}22`, color: INK }}
            />
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
                value={project}
                onChange={(e) => {
                  setProject(e.target.value);
                  setGoalId("");
                }}
                className="w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
                style={{ borderColor: `${INK}22`, color: INK }}
              >
                {projects.length === 0 && <option value="">No projects</option>}
                {projects.map((p) => (
                  <option key={p} value={p}>
                    {p}
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
                className="w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
                style={{ borderColor: `${INK}22`, color: INK }}
              >
                <option value="">No goal</option>
                {availableGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
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
                    className="flex flex-1 flex-col items-center gap-1.5 border py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors"
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
                className="w-full border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
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
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
                style={{ borderColor: `${INK}22`, color: INK }}
              />
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-3 border-t px-6 py-4"
          style={{ borderColor: `${INK}15`, backgroundColor: "#FAFAF7" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold"
            style={{ color: `${INK}88` }}
          >
            Cancel
          </button>
          <button
            onClick={() =>
              canCreate &&
              onCreate({
                name: name.trim(),
                project,
                goalId,
                status,
                startDate,
                endDate,
              })
            }
            disabled={!canCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: INK }}
          >
            <Plus size={13} />
            Create Sprint
          </button>
        </div>
      </div>
    </div>
  );
}

export const Sprints = () => {
  const { openMobileNav } = useDashboardContext();

  const [sprintsByStatus, setSprintsByStatus] =
    useState<Record<SprintStatus, Sprint[]>>(initialSprints);

  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SprintStatus | "all">("all");

  const [addSprintDefaultStatus, setAddSprintDefaultStatus] =
    useState<SprintStatus | null>(null);

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
    project: string;
    goalId: string;
    status: SprintStatus;
    startDate: string;
    endDate: string;
  }) => {
    const newSprint: Sprint = {
      id: `s${Date.now()}`,
      name: data.name,
      project: data.project || "Unassigned",
      goalId: data.goalId || undefined,
      ownerInitials: "—",
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      taskCount: 0,
      taskDone: 0,
    };
    setSprintsByStatus((prev) => ({
      ...prev,
      [data.status]: [...prev[data.status], newSprint],
    }));
    setAddSprintDefaultStatus(null);
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
        subtitle={`${totalSprints} total sprint${totalSprints === 1 ? "" : "s"} · ${activeSprints} active`}
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
          </div>

          <button
            onClick={() => setAddSprintDefaultStatus("planned")}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white"
            style={{ backgroundColor: INK }}
          >
            <Plus size={13} />
            Add Sprint
          </button>
        </div>

        {totalSprints === 0 ? (
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
              />
            ))}
          </div>
        )}
      </main>

      {addSprintDefaultStatus && (
        <CreateSprintModal
          defaultStatus={addSprintDefaultStatus}
          projects={projects}
          onClose={() => setAddSprintDefaultStatus(null)}
          onCreate={handleCreateSprint}
        />
      )}
    </>
  );
};

export default Sprints;
