import { Crown, ShieldCheck, Users, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export type Role = "owner" | "admin" | "member";
export type Tab = "projects" | "members" | "roles" | "activity";
export type ProjectView = "grid" | "list";
export type ProjectStatus = "in-progress" | "planning" | "completed";

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  taskCount: number;
  completedTaskCount: number;
  updatedAt: string;
}

export interface Member {
  userId: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited";
  joinedAt: string;
}

export interface WorkspaceRole {
  _id: string;
  name: string;
  permissions: string[];
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  iconType: "project" | "member" | "role" | "workspace";
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  role: Role;
  color: string;
  icon?: string;
  isPrivate: boolean;
  createdAt: string;
  projects: Project[];
  members: Member[];
  roles: WorkspaceRole[];
  activityLog: ActivityItem[];
}

export interface Toast {
  id: string;
  type: "success" | "info" | "warning";
  message: string;
}

export const WORKSPACE_COLORS = [
  "#6366F1", // Indigo (Default Mongoose color)
  "#8FE3C4", // Mint Teal
  "#3FA9F5", // Sky Blue
  "#F9A8D4", // Soft Pink
  "#FCD34D", // Amber Gold
  "#C4B5FD", // Lavender
  "#FFAB91", // Coral
  "#10B981", // Emerald
];

export const WORKSPACE_ICONS = ["💼", "🚀", "⚡", "🎨", "🛠️", "📊", "🌐", "🎯", "💡", "🔮"];

export const PERMISSION_GROUPS: {
  category: string;
  label: string;
  permissions: { id: string; name: string; desc: string }[];
}[] = [
  {
    category: "billing",
    label: "Billing & Finance",
    permissions: [
      { id: "billing.read", name: "View Invoices", desc: "Access billing history and invoices" },
      { id: "billing.write", name: "Manage Subscriptions", desc: "Update payment methods and plans" },
      { id: "invoices.export", name: "Export Financial Data", desc: "Download CSV reports and PDFs" },
    ],
  },
  {
    category: "deploy",
    label: "Deployments & Release",
    permissions: [
      { id: "deploy.trigger", name: "Trigger Build", desc: "Trigger automated deployment pipelines" },
      { id: "deploy.rollback", name: "Rollback Release", desc: "Revert production deployments" },
    ],
  },
  {
    category: "projects",
    label: "Projects & Tasks",
    permissions: [
      { id: "projects.read", name: "View Projects", desc: "Read access to workspace projects" },
      { id: "projects.write", name: "Create & Edit Projects", desc: "Modify project settings and tasks" },
      { id: "projects.delete", name: "Delete Projects", desc: "Permanently delete projects" },
    ],
  },
  {
    category: "members",
    label: "Team Management",
    permissions: [
      { id: "members.read", name: "View Members", desc: "View team roster and user profiles" },
      { id: "members.invite", name: "Invite Teammates", desc: "Send invitation emails to new users" },
      { id: "members.manage", name: "Manage Roles", desc: "Promote or demote member permissions" },
    ],
  },
  {
    category: "content",
    label: "Content & Publishing",
    permissions: [
      { id: "content.write", name: "Draft Content", desc: "Create and edit project documents" },
      { id: "content.publish", name: "Publish Content", desc: "Publish documents live to team" },
    ],
  },
];

export const ROLE_META: Record<
  Role,
  { badge: string; icon: typeof Crown; label: string }
> = {
  owner: {
    badge: "bg-[#8FE3C4]/15 text-[#0F8A65] ring-[#8FE3C4]/30 border border-[#8FE3C4]/30",
    icon: Crown,
    label: "Owner",
  },
  admin: {
    badge: "bg-[#3FA9F5]/12 text-[#1B79C4] ring-[#3FA9F5]/25 border border-[#3FA9F5]/20",
    icon: ShieldCheck,
    label: "Admin",
  },
  member: {
    badge: "bg-[#9AA6A1]/12 text-[#5B6E68] ring-[#9AA6A1]/20 border border-[#9AA6A1]/20",
    icon: Users,
    label: "Member",
  },
};

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { badge: string; label: string; icon: typeof Clock }
> = {
  "in-progress": {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "In Progress",
    icon: Clock,
  },
  planning: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Planning",
    icon: AlertCircle,
  },
  completed: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Completed",
    icon: CheckCircle2,
  },
};

export const MOCK_WORKSPACES: Workspace[] = [
  {
    _id: "ws-1",
    name: "Acme Engineering",
    description: "Core product & platform engineering team building next-gen solutions.",
    role: "owner",
    color: "#6366F1",
    icon: "💼",
    isPrivate: false,
    createdAt: "2025-02-11",
    projects: [
      {
        _id: "p-1",
        name: "Checkout Rewrite",
        description: "Migrating payment gateway infrastructure to standard Stripe APIs.",
        status: "in-progress",
        taskCount: 18,
        completedTaskCount: 12,
        updatedAt: "2 hours ago",
      },
      {
        _id: "p-2",
        name: "Mobile App v3",
        description: "Complete React Native codebase rebuild with offline storage support.",
        status: "in-progress",
        taskCount: 34,
        completedTaskCount: 20,
        updatedAt: "Yesterday",
      },
      {
        _id: "p-3",
        name: "Internal Design System",
        description: "Shared Tailwind + React component library across products.",
        status: "completed",
        taskCount: 42,
        completedTaskCount: 42,
        updatedAt: "3 days ago",
      },
      {
        _id: "p-4",
        name: "Data Pipeline",
        description: "ETL jobs and event analytics aggregation engine.",
        status: "planning",
        taskCount: 10,
        completedTaskCount: 2,
        updatedAt: "1 week ago",
      },
    ],
    members: [
      {
        userId: "u-1",
        name: "Payal Yadav",
        email: "itme.payalyadav@gmail.com",
        role: "owner",
        status: "active",
        joinedAt: "2025-02-11",
      },
      {
        userId: "u-2",
        name: "Priya Raman",
        email: "priya@acme.com",
        role: "admin",
        status: "active",
        joinedAt: "2025-02-14",
      },
      {
        userId: "u-3",
        name: "Devon Ortiz",
        email: "devon@acme.com",
        role: "member",
        status: "active",
        joinedAt: "2025-03-01",
      },
      {
        userId: "u-4",
        name: "Lena Kessler",
        email: "lena@acme.com",
        role: "member",
        status: "invited",
        joinedAt: "2026-08-01",
      },
    ],
    roles: [
      {
        _id: "r-1",
        name: "Billing Manager",
        permissions: ["billing.read", "billing.write", "invoices.export"],
      },
      {
        _id: "r-2",
        name: "Release Lead",
        permissions: ["deploy.trigger", "deploy.rollback", "projects.write"],
      },
    ],
    activityLog: [
      {
        id: "act-1",
        user: "Payal Yadav",
        action: "created project",
        target: "Checkout Rewrite",
        timestamp: "2 hours ago",
        iconType: "project",
      },
      {
        id: "act-2",
        user: "Priya Raman",
        action: "invited member",
        target: "lena@acme.com",
        timestamp: "Yesterday",
        iconType: "member",
      },
      {
        id: "act-3",
        user: "Payal Yadav",
        action: "created custom role",
        target: "Release Lead",
        timestamp: "3 days ago",
        iconType: "role",
      },
    ],
  },
  {
    _id: "ws-2",
    name: "Northwind Design",
    description: "Brand identity, marketing landing pages, and UI/UX design ops.",
    role: "admin",
    color: "#3FA9F5",
    icon: "🎨",
    isPrivate: true,
    createdAt: "2025-05-03",
    projects: [
      {
        _id: "p-5",
        name: "Q3 Brand Refresh",
        description: "New typography, color palette tokens, and icon kit.",
        status: "in-progress",
        taskCount: 15,
        completedTaskCount: 9,
        updatedAt: "4 hours ago",
      },
      {
        _id: "p-6",
        name: "Marketing Site",
        description: "Next.js redesign for high performance and SEO.",
        status: "planning",
        taskCount: 8,
        completedTaskCount: 1,
        updatedAt: "2 days ago",
      },
    ],
    members: [
      {
        userId: "u-1",
        name: "Payal Yadav",
        email: "itme.payalyadav@gmail.com",
        role: "admin",
        status: "active",
        joinedAt: "2025-05-03",
      },
      {
        userId: "u-5",
        name: "Marcus Webb",
        email: "marcus@nwd.com",
        role: "owner",
        status: "active",
        joinedAt: "2025-05-03",
      },
      {
        userId: "u-6",
        name: "Sofia Chen",
        email: "sofia@nwd.com",
        role: "member",
        status: "active",
        joinedAt: "2025-06-12",
      },
    ],
    roles: [
      {
        _id: "r-3",
        name: "Content Editor",
        permissions: ["content.write", "content.publish"],
      },
    ],
    activityLog: [
      {
        id: "act-4",
        user: "Marcus Webb",
        action: "updated workspace description",
        target: "Northwind Design",
        timestamp: "5 hours ago",
        iconType: "workspace",
      },
      {
        id: "act-5",
        user: "Sofia Chen",
        action: "completed 3 tasks in",
        target: "Q3 Brand Refresh",
        timestamp: "1 day ago",
        iconType: "project",
      },
    ],
  },
  {
    _id: "ws-3",
    name: "Personal Sandbox",
    description: "Private experimentation and rapid prototype playground.",
    role: "owner",
    color: "#F9A8D4",
    icon: "🚀",
    isPrivate: true,
    createdAt: "2026-01-20",
    projects: [
      {
        _id: "p-7",
        name: "Weekend Prototype",
        description: "AI prompt engineering and smart canvas experiment.",
        status: "in-progress",
        taskCount: 5,
        completedTaskCount: 4,
        updatedAt: "Just now",
      },
    ],
    members: [
      {
        userId: "u-1",
        name: "Payal Yadav",
        email: "itme.payalyadav@gmail.com",
        role: "owner",
        status: "active",
        joinedAt: "2026-01-20",
      },
    ],
    roles: [],
    activityLog: [
      {
        id: "act-6",
        user: "Payal Yadav",
        action: "created workspace",
        target: "Personal Sandbox",
        timestamp: "2026-01-20",
        iconType: "workspace",
      },
    ],
  },
];

let idCounter = 300;
export const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const groupPermissions = (permissions: string[]) => {
  const groups: Record<string, string[]> = {};
  for (const p of permissions) {
    const [ns] = p.split(".");
    const key = ns ?? "general";
    groups[key] = [...(groups[key] ?? []), p];
  }
  return Object.entries(groups);
};

export const inputClass =
  "w-full rounded-xl border border-[#0F2D29]/10 bg-white px-3.5 py-2 text-[13px] text-[#0F2D29] outline-none placeholder:text-[#8FA69E] focus:border-[#8FE3C4] focus:ring-2 focus:ring-[#8FE3C4]/20 transition";
