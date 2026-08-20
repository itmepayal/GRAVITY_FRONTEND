import {
  LayoutDashboard,
  ListTodo,
  Users,
  Settings,
  type LucideIcon,
  // Bell,
  // BarChart3,
  CalendarDays,
  KanbanSquare,
  FolderKanban,
  // CreditCard,
  // Plug,
  // LineChart,
  // FolderOpen,
  // FileText,
  // Inbox,
  UsersRound,
  ShieldCheck,
  Target,
  // GanttChartSquare,
  TimerReset,
  BriefcaseBusiness,
  Layers,
  Clock,
  TrendingUp,
  GanttChartSquare,
} from "lucide-react";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavSection = {
  label: string | null;
  items: NavItem[];
};

export const DASHBOARD_NAV: NavSection[] = [
  {
    label: null,
    items: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Workspace & Planning",
    items: [
      {
        label: "Workspaces",
        path: "/dashboard/workspaces",
        icon: BriefcaseBusiness,
      },
      { label: "Projects", path: "/dashboard/projects", icon: FolderKanban },
      { label: "Boards", path: "/dashboard/boards", icon: KanbanSquare },
      { label: "Sprints", path: "/dashboard/sprints", icon: TimerReset },
    ],
  },
  {
    label: "Task Management",
    items: [
      {
        label: "My Tasks",
        path: "/dashboard/tasks",
        icon: ListTodo,
        badge: "Active",
      },
      { label: "Backlog", path: "/dashboard/backlog", icon: Layers },
      { label: "Calendar", path: "/dashboard/calendar", icon: CalendarDays },
      {
        label: "Timeline & Gantt",
        path: "/dashboard/timeline",
        icon: GanttChartSquare,
      },
      { label: "Goals & OKRs", path: "/dashboard/goals", icon: Target },
      { label: "Time Tracking", path: "/dashboard/time-tracking", icon: Clock },
    ],
  },
  {
    label: "Team & Access",
    items: [
      { label: "Members", path: "/dashboard/members", icon: Users },
      { label: "Teams", path: "/dashboard/teams", icon: UsersRound },
      {
        label: "Roles & Permissions",
        path: "/dashboard/roles",
        icon: ShieldCheck,
      },
      { label: "Activity Log", path: "/dashboard/activity-log", icon: TrendingUp },
    ],
  },
  // {
  //   label: "Communication & Docs",
  //   items: [
  //     { label: "Inbox", path: "/dashboard/inbox", icon: Inbox },
  //     { label: "Notifications", path: "/dashboard/notifications", icon: Bell },
  //     { label: "Files & Assets", path: "/dashboard/files", icon: FolderOpen },
  //     { label: "Documents", path: "/dashboard/documents", icon: FileText },
  //   ],
  // },
  {
    label: "Analytics & Admin",
    items: [
      // { label: "Reports", path: "/dashboard/reports", icon: BarChart3 },
      // { label: "Analytics", path: "/dashboard/analytics", icon: LineChart },
      // { label: "Integrations", path: "/dashboard/integrations", icon: Plug },
      // { label: "Billing & Plan", path: "/dashboard/billing", icon: CreditCard },
      { label: "Settings", path: "/dashboard/settings", icon: Settings },
    ],
  },
];

export type TaskStatus = "done" | "active" | "blocked" | "pending";

export const STATUS_STYLES: Record<
  TaskStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  done: {
    label: "Done",
    dot: "bg-[#8FE3C4]",
    text: "text-[#0F2D29]",
    bg: "bg-[#8FE3C4]/12",
  },
  active: {
    label: "Active",
    dot: "bg-[#0F2D29]",
    text: "text-[#0F2D29]",
    bg: "bg-[#0F2D29]/10",
  },
  blocked: {
    label: "Blocked",
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
  },
  pending: {
    label: "Pending",
    dot: "bg-[#9AA6A1]",
    text: "text-[#5B6E68]",
    bg: "bg-[#9AA6A1]/12",
  },
};

export {
  MOCK_TASKS,
  MOCK_MEMBERS,
  MOCK_ARCHIVED,
  type Task,
  type Member,
} from "@/types/dashboard";
