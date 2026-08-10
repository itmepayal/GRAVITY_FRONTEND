import { CheckCircle2, ClipboardList, PlayCircle, Eye, FlaskConical, Ban, ArrowDown, Minus, ArrowUp, Flame, type LucideIcon } from "lucide-react";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "in_review"
  | "testing"
  | "completed"
  | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled"
  | "archived";

export interface RefUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface IWorkspaceMember {
  user: RefUser;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface IWorkspace {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  owner: RefUser;
  members: IWorkspaceMember[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProjectMember {
  user: RefUser;
  role: { id: string; name: string };
  joinedAt: string;
}

export interface IProject {
  id: string;
  name: string;
  description?: string;
  workspace: IWorkspace;
  owner: RefUser;
  members: IProjectMember[];
  tasks: string[];
  color?: string;
  status: ProjectStatus;
  progress: number;
  isArchived: boolean;
  archivedAt?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBoard {
  id: string;
  name: string;
  workspace: IWorkspace;
  project: IProject;
  description?: string;
  type: "kanban" | "scrum";
  columns: string[];
  createdBy: RefUser;
  createdAt: string;
  updatedAt: string;
}

export interface ISprint {
  id: string;
  name: string;
  status: "active" | "planned" | "completed";
  startDate?: string;
  endDate?: string;
}

export interface ISubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface IComment {
  id: string;
  user: RefUser;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  publicId: string;
  fileType: string;
  fileSize: number;
  uploadedBy: RefUser;
  uploadedAt: string;
}

export interface ITask {
  id: string;
  title: string;
  description?: string;
  board: IBoard;
  project: IProject;
  workspace: IWorkspace;
  sprint?: ISprint;
  column: string;
  assignee?: RefUser;
  watchers: RefUser[];
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours: number;
  subtasks: ISubTask[];
  comments: IComment[];
  attachments: IAttachment[];
  isArchived: boolean;
  createdBy: RefUser;
  createdAt: string;
  updatedAt: string;
}

export const PRIMARY_COLOR = "#0F2D29";

export const STATUS_META: Record<
  TaskStatus,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  todo: {
    label: "To Do",
    icon: ClipboardList,
    color: "#5B6E68",
    bg: "rgba(15, 45, 41, 0.06)",
  },
  in_progress: {
    label: "In Progress",
    icon: PlayCircle,
    color: "#0F2D29",
    bg: "rgba(15, 45, 41, 0.12)",
  },
  in_review: {
    label: "In Review",
    icon: Eye,
    color: "#0F2D29",
    bg: "rgba(15, 45, 41, 0.08)",
  },
  testing: {
    label: "Testing",
    icon: FlaskConical,
    color: "#0F2D29",
    bg: "rgba(15, 45, 41, 0.08)",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "#0F2D29",
    bg: "rgba(15, 45, 41, 0.15)",
  },
  blocked: {
    label: "Blocked",
    icon: Ban,
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.1)",
  },
};

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  low: {
    label: "Low",
    icon: ArrowDown,
    color: "#5B6E68",
    bg: "rgba(91, 110, 104, 0.08)",
  },
  medium: {
    label: "Medium",
    icon: Minus,
    color: "#0F2D29",
    bg: "rgba(15, 45, 41, 0.08)",
  },
  high: {
    label: "High",
    icon: ArrowUp,
    color: "#0F2D29",
    bg: "rgba(15, 45, 41, 0.14)",
  },
  urgent: {
    label: "Urgent",
    icon: Flame,
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.1)",
  },
};

export const initials = (name?: string) => {
  if (!name) return "?";
  const cleaned = name.replace(/\([^)]*\)/g, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const formatDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export const getDaysRemaining = (dueDate?: string) => {
  if (!dueDate) return null;
  const due = new Date(dueDate).getTime();
  if (Number.isNaN(due)) return null;
  return Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24));
};

export const relativeTime = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const minutes = Math.round((Date.now() - d.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value) ?? value;
};

export const fileSizeFormatted = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const columnToStatus: Record<string, TaskStatus> = {
  Backlog: "todo",
  "To Do": "todo",
  "In Progress": "in_progress",
  "In Review": "in_review",
  Testing: "testing",
  Done: "completed",
  Completed: "completed",
};
