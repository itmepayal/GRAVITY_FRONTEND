import {
  Rocket,
  Zap,
  PauseCircle,
  CheckCircle2,
  Ban,
  Archive,
} from "lucide-react";

export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled"
  | "archived";

export interface RefUser {
  id: string;
  name?: string;
  email?: string;
  avatar?: string | null;
}

export interface ProjectMember {
  user: RefUser;
  role: string;
  joinedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspace: string;
  workspaceName?: string;
  owner: RefUser;
  members: ProjectMember[];
  tasksCount?: number;
  completedTasksCount?: number;
  color: string;
  status: ProjectStatus;
  progress: number;
  isArchived: boolean;
  archivedAt?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_META: Record<
  ProjectStatus,
  {
    label: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
  }
> = {
  planning: {
    label: "Planning",
    icon: Rocket,
    color: "#5B6E68",
    bg: "rgba(91, 110, 104, 0.08)",
    border: "rgba(91, 110, 104, 0.2)",
  },
  active: {
    label: "Active",
    icon: Zap,
    color: "#0F8A65",
    bg: "rgba(15, 138, 101, 0.08)",
    border: "rgba(15, 138, 101, 0.25)",
  },
  on_hold: {
    label: "On Hold",
    icon: PauseCircle,
    color: "#D97706",
    bg: "rgba(217, 119, 6, 0.08)",
    border: "rgba(217, 119, 6, 0.25)",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "#2563EB",
    bg: "rgba(37, 99, 235, 0.08)",
    border: "rgba(37, 99, 235, 0.25)",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.08)",
    border: "rgba(220, 38, 38, 0.25)",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    color: "#6B7280",
    bg: "rgba(107, 114, 128, 0.08)",
    border: "rgba(107, 114, 128, 0.25)",
  },
};

export const normalizeUser = (raw: any): RefUser => {
  if (typeof raw === "string") {
    return { id: raw, name: "Unknown", email: "" };
  }
  return {
    id: raw?._id ?? raw?.id ?? "u-anon",
    name: raw?.name ?? raw?.email ?? "Teammate",
    email: raw?.email ?? "",
    avatar: raw?.avatar ?? null,
  };
};

export const normalizeProjectMember = (raw: any): ProjectMember => ({
  user: normalizeUser(raw?.user ?? raw),
  role: typeof raw?.role === "object" ? raw?.role?.name ?? "member" : raw?.role ?? "member",
  joinedAt: raw?.joinedAt ?? raw?.createdAt ?? new Date().toISOString(),
});

export const normalizeProjectData = (raw: any): Project => ({
  id: raw._id ?? raw.id,
  name: raw.name ?? "Untitled Project",
  description: raw.description ?? "",
  workspace: typeof raw.workspace === "object" ? raw.workspace?._id ?? raw.workspace?.id : raw.workspace ?? "",
  workspaceName: typeof raw.workspace === "object" ? raw.workspace?.name : undefined,
  owner: normalizeUser(raw.owner),
  members: (raw.members ?? []).map(normalizeProjectMember),
  tasksCount: raw.tasksCount ?? raw.taskCount ?? (Array.isArray(raw.tasks) ? raw.tasks.length : 0),
  completedTasksCount: raw.completedTasksCount ?? raw.completedTaskCount ?? 0,
  color: raw.color || "#0F2D29",
  status: (raw.status as ProjectStatus) || "planning",
  progress: typeof raw.progress === "number" ? raw.progress : 0,
  isArchived: Boolean(raw.isArchived),
  archivedAt: raw.archivedAt,
  startDate: raw.startDate,
  dueDate: raw.dueDate ?? raw.targetDate,
  createdAt: raw.createdAt ?? new Date().toISOString(),
  updatedAt: raw.updatedAt ?? new Date().toISOString(),
});

export const initials = (str: string) => {
  const parts = str.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return str.slice(0, 2).toUpperCase();
};
