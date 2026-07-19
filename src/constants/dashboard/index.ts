import {
  LayoutDashboard,
  ListTodo,
  Users,
  Archive,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Tasks", path: "/dashboard/tasks", icon: ListTodo },
  { label: "Members", path: "/dashboard/members", icon: Users },
  { label: "Archived", path: "/dashboard/archived", icon: Archive },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
];

export type TaskStatus = "done" | "active" | "blocked" | "pending";

export const STATUS_STYLES: Record<
  TaskStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  done: {
    label: "Done",
    dot: "bg-[#8FE3C4]",
    text: "text-[#0F8A65]",
    bg: "bg-[#8FE3C4]/12",
  },
  active: {
    label: "Active",
    dot: "bg-[#3FA9F5]",
    text: "text-[#1B79C4]",
    bg: "bg-[#3FA9F5]/10",
  },
  blocked: {
    label: "Blocked",
    dot: "bg-[#E98A57]",
    text: "text-[#B85E2E]",
    bg: "bg-[#E98A57]/12",
  },
  pending: {
    label: "Pending",
    dot: "bg-[#9AA6A1]",
    text: "text-[#5B6E68]",
    bg: "bg-[#9AA6A1]/12",
  },
};

export type Task = {
  id: string;
  title: string;
  project: string;
  status: TaskStatus;
  due: string;
  assignee: { name: string; color: string };
};

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    title: "Wire billing webhook retries",
    project: "Launch v2.3",
    status: "blocked",
    due: "Today",
    assignee: { name: "Payal Yadav", color: "#8FE3C4" },
  },
  {
    id: "t2",
    title: "Migrate schema for mobile client",
    project: "Launch v2.3",
    status: "active",
    due: "Tomorrow",
    assignee: { name: "Rhea Kapoor", color: "#E98A57" },
  },
  {
    id: "t3",
    title: "Auth service rate-limit rules",
    project: "Launch v2.3",
    status: "active",
    due: "Jul 22",
    assignee: { name: "Dev Malhotra", color: "#3FA9F5" },
  },
  {
    id: "t4",
    title: "Write onboarding email sequence",
    project: "Growth",
    status: "pending",
    due: "Jul 24",
    assignee: { name: "Payal Yadav", color: "#8FE3C4" },
  },
  {
    id: "t5",
    title: "QA pass on scheduling engine",
    project: "Launch v2.3",
    status: "done",
    due: "Jul 15",
    assignee: { name: "Ishaan Roy", color: "#B7CFC7" },
  },
];

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  color: string;
  tasksActive: number;
  status: "online" | "offline";
};

export const MOCK_MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Payal Yadav",
    email: "itme.payalyadav@gmail.com",
    role: "Owner",
    color: "#8FE3C4",
    tasksActive: 4,
    status: "online",
  },
  {
    id: "m2",
    name: "Rhea Kapoor",
    email: "rhea@gravity.app",
    role: "Admin",
    color: "#E98A57",
    tasksActive: 3,
    status: "online",
  },
  {
    id: "m3",
    name: "Dev Malhotra",
    email: "dev@gravity.app",
    role: "Member",
    color: "#3FA9F5",
    tasksActive: 2,
    status: "offline",
  },
  {
    id: "m4",
    name: "Ishaan Roy",
    email: "ishaan@gravity.app",
    role: "Member",
    color: "#B7CFC7",
    tasksActive: 1,
    status: "offline",
  },
];

export const MOCK_ARCHIVED: Task[] = [
  {
    id: "a1",
    title: "Set up staging environment",
    project: "Launch v2.2",
    status: "done",
    due: "Jun 30",
    assignee: { name: "Dev Malhotra", color: "#3FA9F5" },
  },
  {
    id: "a2",
    title: "Draft pricing page copy",
    project: "Growth",
    status: "done",
    due: "Jun 18",
    assignee: { name: "Rhea Kapoor", color: "#E98A57" },
  },
  {
    id: "a3",
    title: "Legacy auth token cleanup",
    project: "Launch v2.1",
    status: "done",
    due: "May 29",
    assignee: { name: "Ishaan Roy", color: "#B7CFC7" },
  },
];
