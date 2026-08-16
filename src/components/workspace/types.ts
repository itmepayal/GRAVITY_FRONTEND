import {
  Crown,
  ShieldCheck,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Archive,
  PauseCircle,
  type LucideIcon,
  Eye,
} from "lucide-react";

export type Role = "owner" | "admin" | "member" | "viewer";
export type Tab = "projects" | "members" | "roles" | "activity";
export type ProjectView = "grid" | "list";
export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled"
  | "archived";

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
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  role: Role;
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

export const WORKSPACE_ICONS = [
  "💼",
  "🚀",
  "⚡",
  "🎨",
  "🛠️",
  "📊",
  "🌐",
  "🎯",
  "💡",
  "🔮",
];

export const PERMISSION_GROUPS: {
  category: string;
  label: string;
  permissions: { id: string; name: string; desc: string }[];
}[] = [
  {
    category: "billing",
    label: "Billing & Finance",
    permissions: [
      {
        id: "billing.read",
        name: "View Invoices",
        desc: "Access billing history and invoices",
      },
      {
        id: "billing.write",
        name: "Manage Subscriptions",
        desc: "Update payment methods and plans",
      },
      {
        id: "invoices.export",
        name: "Export Financial Data",
        desc: "Download CSV reports and PDFs",
      },
    ],
  },
  {
    category: "deploy",
    label: "Deployments & Release",
    permissions: [
      {
        id: "deploy.trigger",
        name: "Trigger Build",
        desc: "Trigger automated deployment pipelines",
      },
      {
        id: "deploy.rollback",
        name: "Rollback Release",
        desc: "Revert production deployments",
      },
    ],
  },
  {
    category: "projects",
    label: "Projects & Tasks",
    permissions: [
      {
        id: "projects.read",
        name: "View Projects",
        desc: "Read access to workspace projects",
      },
      {
        id: "projects.write",
        name: "Create & Edit Projects",
        desc: "Modify project settings and tasks",
      },
      {
        id: "projects.delete",
        name: "Delete Projects",
        desc: "Permanently delete projects",
      },
    ],
  },
  {
    category: "members",
    label: "Team Management",
    permissions: [
      {
        id: "members.read",
        name: "View Members",
        desc: "View team roster and user profiles",
      },
      {
        id: "members.invite",
        name: "Invite Teammates",
        desc: "Send invitation emails to new users",
      },
      {
        id: "members.manage",
        name: "Manage Roles",
        desc: "Promote or demote member permissions",
      },
    ],
  },
  {
    category: "content",
    label: "Content & Publishing",
    permissions: [
      {
        id: "content.write",
        name: "Draft Content",
        desc: "Create and edit project documents",
      },
      {
        id: "content.publish",
        name: "Publish Content",
        desc: "Publish documents live to team",
      },
    ],
  },
];

export const ROLE_META: Record<
  Role,
  { badge: string; icon: typeof Crown; label: string }
> = {
  owner: {
    badge:
      "bg-[#8FE3C4]/15 text-[#0F8A65] ring-[#8FE3C4]/30 border border-[#8FE3C4]/30",
    icon: Crown,
    label: "Owner",
  },
  admin: {
    badge:
      "bg-[#3FA9F5]/12 text-[#1B79C4] ring-[#3FA9F5]/25 border border-[#3FA9F5]/20",
    icon: ShieldCheck,
    label: "Admin",
  },
  member: {
    badge:
      "bg-[#9AA6A1]/12 text-[#5B6E68] ring-[#9AA6A1]/20 border border-[#9AA6A1]/20",
    icon: Users,
    label: "Member",
  },
  viewer: {
    badge:
      "bg-[#C4B5FD]/12 text-[#6D5BD0] ring-[#C4B5FD]/25 border border-[#C4B5FD]/20",
    icon: Eye,
    label: "Viewer",
  },
};

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  {
    badge: string;
    label: string;
    icon: LucideIcon;
  }
> = {
  planning: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Planning",
    icon: AlertCircle,
  },

  active: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Active",
    icon: Clock,
  },

  on_hold: {
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    label: "On Hold",
    icon: PauseCircle,
  },

  completed: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Completed",
    icon: CheckCircle2,
  },

  cancelled: {
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Cancelled",
    icon: XCircle,
  },

  archived: {
    badge: "bg-gray-50 text-gray-700 border-gray-200",
    label: "Archived",
    icon: Archive,
  },
};

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
