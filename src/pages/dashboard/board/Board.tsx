import { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import {
  Plus,
  MoreHorizontal,
  MessageSquare,
  Paperclip,
  Flag,
  CalendarDays,
  KanbanSquare,
  ChevronDown,
  Search,
  ListTodo,
  Clock,
  CheckCircle2,
  Users,
  X,
  Check,
} from "lucide-react";

const INK = "#0F2D29";
const MINT = "#8FE3C4";
const TEAL = "#0F8A65";

const boardMeta = {
  name: "Aurora Design System",
  description: "Component library rollout — sprint board",
  type: "kanban" as "kanban" | "scrum",
};

type Priority = "low" | "medium" | "high" | "urgent";

const PRIORITY_META: Record<
  Priority,
  { label: string; color: string; bg: string }
> = {
  low: { label: "Low", color: INK, bg: "#EDEBE3" },
  medium: { label: "Medium", color: "#C2680B", bg: "#FDF1E4" },
  high: { label: "High", color: "#B3261E", bg: "#FBEAE9" },
  urgent: { label: "Urgent", color: "#B3261E", bg: "#FBEAE9" },
};

const PRIORITY_ORDER: Priority[] = ["low", "medium", "high", "urgent"];

type TagName = "Design" | "Frontend" | "Backend" | "Bug" | "Docs";

const TAG_COLORS: Record<TagName, { color: string; bg: string }> = {
  Design: { color: "#3B5BDB", bg: "#EAF0FE" },
  Frontend: { color: TEAL, bg: "#E7F5EF" },
  Backend: { color: "#0B6E4F", bg: "#E4F5EC" },
  Bug: { color: "#B3261E", bg: "#FBEAE9" },
  Docs: { color: "#6A4EE0", bg: "#EFEBFC" },
};

const DEFAULT_COLUMNS = ["Backlog", "Todo", "In Progress", "Review", "Done"];

interface Task {
  id: string;
  title: string;
  priority: Priority;
  tags: TagName[];
  assignee: string;
  comments: number;
  attachments: number;
  due: string | null;
}

const initialTasks: Record<string, Task[]> = {
  Backlog: [
    {
      id: "t1",
      title: "Audit existing color tokens across product surfaces",
      priority: "low",
      tags: ["Design"],
      assignee: "PY",
      comments: 2,
      attachments: 0,
      due: null,
    },
    {
      id: "t2",
      title: "Research accessible focus-ring patterns",
      priority: "medium",
      tags: ["Design", "Docs"],
      assignee: "RK",
      comments: 0,
      attachments: 1,
      due: null,
    },
  ],
  Todo: [
    {
      id: "t3",
      title: "Build Button component with all variants",
      priority: "high",
      tags: ["Frontend"],
      assignee: "PY",
      comments: 3,
      attachments: 0,
      due: "Aug 14",
    },
    {
      id: "t4",
      title: "Define spacing scale in tailwind config",
      priority: "medium",
      tags: ["Frontend"],
      assignee: "SN",
      comments: 1,
      attachments: 0,
      due: "Aug 15",
    },
    {
      id: "t5",
      title: "Set up Storybook for component previews",
      priority: "low",
      tags: ["Docs"],
      assignee: "RK",
      comments: 0,
      attachments: 0,
      due: null,
    },
  ],
  "In Progress": [
    {
      id: "t6",
      title: "Implement Modal + Drawer primitives",
      priority: "high",
      tags: ["Frontend", "Bug"],
      assignee: "PY",
      comments: 5,
      attachments: 2,
      due: "Aug 12",
    },
    {
      id: "t7",
      title: "Wire theming API to backend config service",
      priority: "urgent",
      tags: ["Backend"],
      assignee: "AM",
      comments: 2,
      attachments: 1,
      due: "Aug 13",
    },
  ],
  Review: [
    {
      id: "t8",
      title: "Form field validation states — PR review",
      priority: "medium",
      tags: ["Frontend"],
      assignee: "SN",
      comments: 4,
      attachments: 0,
      due: "Aug 11",
    },
  ],
  Done: [
    {
      id: "t9",
      title: "Typography scale finalized and documented",
      priority: "low",
      tags: ["Docs"],
      assignee: "RK",
      comments: 1,
      attachments: 1,
      due: null,
    },
    {
      id: "t10",
      title: "Icon set audit and cleanup",
      priority: "low",
      tags: ["Design"],
      assignee: "PY",
      comments: 0,
      attachments: 0,
      due: null,
    },
  ],
};

function TaskCard({ task }: { task: Task }) {
  const priority = PRIORITY_META[task.priority];
  return (
    <div
      className="cursor-pointer border bg-white p-3.5 transition-shadow hover:shadow-md"
      style={{ borderColor: `${INK}22` }}
    >
      {task.tags?.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {task.tags.map((tag) => {
            const meta = TAG_COLORS[tag] || { color: INK, bg: "#EDEBE3" };
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

      <p
        className="mb-3.5 text-sm font-bold leading-snug"
        style={{ color: INK }}
      >
        {task.title}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: priority.color, backgroundColor: priority.bg }}
          >
            <Flag size={10} />
            {priority.label}
          </span>
          {task.due && (
            <span
              className="flex items-center gap-1 text-[11px] font-medium"
              style={{ color: `${INK}77` }}
            >
              <CalendarDays size={11} />
              {task.due}
            </span>
          )}
        </div>

        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center text-[9px] font-bold"
          style={{ backgroundColor: MINT, color: INK }}
        >
          {task.assignee}
        </div>
      </div>

      {(task.comments > 0 || task.attachments > 0) && (
        <div
          className="mt-3 flex items-center gap-3 border-t pt-3 text-[11px] font-medium"
          style={{ borderColor: `${INK}15`, color: `${INK}77` }}
        >
          {task.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={11} />
              {task.comments}
            </span>
          )}
          {task.attachments > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip size={11} />
              {task.attachments}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface ColumnProps {
  name: string;
  tasks: Task[];
  onAddTask: (columnName: string) => void;
}

function Column({ name, tasks, onAddTask }: ColumnProps) {
  return (
    <div className="flex max-h-full w-72 shrink-0 flex-col">
      <div className="flex items-center justify-between px-0.5 pb-3">
        <span
          className="flex items-center gap-2 text-sm font-black"
          style={{ color: INK }}
        >
          {name}
          <span
            className="flex h-5 w-5 items-center justify-center text-[11px] font-bold"
            style={{ backgroundColor: "#EDEBE3", color: `${INK}99` }}
          >
            {tasks.length}
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
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && (
          <p
            className="py-4 text-center text-[11px] font-medium"
            style={{ color: `${INK}55` }}
          >
            No matching tasks
          </p>
        )}

        <button
          onClick={() => onAddTask(name)}
          className="flex w-full items-center justify-center gap-1.5 border border-dashed py-2.5 text-xs font-bold"
          style={{ borderColor: `${INK}33`, color: `${INK}77` }}
        >
          <Plus size={13} />
          Add Task
        </button>
      </div>
    </div>
  );
}

export const Board = () => {
  const { openMobileNav } = useDashboardContext();

  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [tasks, setTasks] = useState<Record<string, Task[]>>(initialTasks);

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const totalTasks = Object.values(tasks).reduce(
    (sum, col) => sum + col.length,
    0,
  );
  const doneTasks = tasks.Done?.length ?? 0;
  const inProgressTasks = tasks["In Progress"]?.length ?? 0;
  const assignees = new Set(
    Object.values(tasks)
      .flat()
      .map((t) => t.assignee),
  ).size;

  const metricCards = [
    {
      title: "Total Tasks",
      value: totalTasks,
      subtitle: "Across all columns",
      icon: ListTodo,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      subtitle: "Currently being worked",
      icon: Clock,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Completed",
      value: doneTasks,
      subtitle: "Marked as done",
      icon: CheckCircle2,
      accentColor: "#2563EB",
      bgGradient: "from-[#2563EB]/10 to-transparent",
    },
    {
      title: "Contributors",
      value: assignees,
      subtitle: "Active board members",
      icon: Users,
      accentColor: "#D97706",
      bgGradient: "from-[#D97706]/10 to-transparent",
    },
  ];

  const handleAddColumn = () => {
    const name = newColumnName.trim();
    if (!name) return;
    if (columns.includes(name)) {
      setNewColumnName("");
      setShowAddColumn(false);
      return;
    }
    setColumns((prev) => [...prev, name]);
    setTasks((prev) => ({ ...prev, [name]: [] }));
    setNewColumnName("");
    setShowAddColumn(false);
  };

  const handleAddTask = (columnName: string) => {
    const title = window.prompt(`New task title for "${columnName}"`);
    if (!title?.trim()) return;
    setTasks((prev) => ({
      ...prev,
      [columnName]: [
        ...(prev[columnName] || []),
        {
          id: `t${Date.now()}`,
          title: title.trim(),
          priority: "medium",
          tags: [],
          assignee: "—",
          comments: 0,
          attachments: 0,
          due: null,
        },
      ],
    }));
  };

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result: Record<string, Task[]> = {};
    for (const col of columns) {
      const list = tasks[col] || [];
      result[col] = list.filter((task) => {
        const matchesQuery = query
          ? task.title.toLowerCase().includes(query)
          : true;
        const matchesPriority = priorityFilter
          ? task.priority === priorityFilter
          : true;
        return matchesQuery && matchesPriority;
      });
    }
    return result;
  }, [tasks, columns, searchQuery, priorityFilter]);

  return (
    <>
      <Topbar
        variant="light"
        title={boardMeta.name}
        subtitle={`${totalTasks} tasks · ${boardMeta.description}`}
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
                id="board-search-input"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 border bg-white py-2.5 pl-8 pr-3 text-xs outline-none"
                style={{ borderColor: `${INK}22`, color: INK }}
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilterMenu((v) => !v)}
                className="flex items-center gap-1.5 border bg-white px-3 py-2.5 text-xs font-bold"
                style={{
                  borderColor: priorityFilter ? TEAL : `${INK}22`,
                  color: priorityFilter ? TEAL : INK,
                }}
              >
                {priorityFilter
                  ? `Priority: ${PRIORITY_META[priorityFilter].label}`
                  : "Filter"}
                <ChevronDown size={13} />
              </button>

              {showFilterMenu && (
                <div
                  className="absolute left-0 top-full z-10 mt-1.5 w-44 border bg-white py-1 shadow-lg"
                  style={{ borderColor: `${INK}22` }}
                >
                  <button
                    onClick={() => {
                      setPriorityFilter(null);
                      setShowFilterMenu(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold hover:bg-[#EDEBE3]"
                    style={{ color: INK }}
                  >
                    All priorities
                    {!priorityFilter && <Check size={12} />}
                  </button>
                  {PRIORITY_ORDER.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPriorityFilter(p);
                        setShowFilterMenu(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold hover:bg-[#EDEBE3]"
                      style={{ color: PRIORITY_META[p].color }}
                    >
                      {PRIORITY_META[p].label}
                      {priorityFilter === p && <Check size={12} />}
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
              {boardMeta.type}
            </span>
          </div>

          <div className="relative">
            {showAddColumn ? (
              <div
                className="flex items-center gap-1.5 border bg-white p-1.5"
                style={{ borderColor: `${INK}22` }}
              >
                <input
                  autoFocus
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn();
                    if (e.key === "Escape") {
                      setShowAddColumn(false);
                      setNewColumnName("");
                    }
                  }}
                  placeholder="Column name..."
                  className="w-40 px-2 py-1.5 text-xs outline-none"
                  style={{ color: INK }}
                />
                <button
                  onClick={handleAddColumn}
                  className="flex h-7 w-7 items-center justify-center text-white"
                  style={{ backgroundColor: TEAL }}
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnName("");
                  }}
                  className="flex h-7 w-7 items-center justify-center"
                  style={{ color: `${INK}77` }}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white"
                style={{ backgroundColor: INK }}
              >
                <Plus size={13} />
                Add Column
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden pb-2">
          {columns.map((col) => (
            <Column
              key={col}
              name={col}
              tasks={filteredTasks[col] || []}
              onAddTask={handleAddTask}
            />
          ))}
        </div>
      </main>
    </>
  );
};

export default Board;
