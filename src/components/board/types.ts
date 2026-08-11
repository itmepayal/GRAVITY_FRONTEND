import { Kanban, LayoutGrid } from "lucide-react";
import type { IBoard } from "@/types/task";

export type BoardType = "kanban" | "scrum";

export interface BoardItem {
  id: string;
  name: string;
  description?: string;
  type: BoardType;
  columns: string[];
  workspaceId: string;
  workspaceName: string;
  projectId: string;
  projectName: string;
  tasksCount: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export const TYPE_META: Record<
  BoardType,
  { label: string; icon: typeof Kanban; color: string; bg: string; border: string }
> = {
  kanban: {
    label: "Kanban",
    icon: Kanban,
    color: "#0F8A65",
    bg: "rgba(15, 138, 101, 0.1)",
    border: "rgba(15, 138, 101, 0.25)",
  },
  scrum: {
    label: "Scrum",
    icon: LayoutGrid,
    color: "#2563EB",
    bg: "rgba(37, 99, 235, 0.1)",
    border: "rgba(37, 99, 235, 0.25)",
  },
};

export const initials = (name?: string) =>
  (name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

export function normalizeBoard(raw: IBoard, tasksCount = 0): BoardItem {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    type: raw.type,
    columns: raw.columns ?? [],
    workspaceId: raw.workspace.id,
    workspaceName: raw.workspace.name,
    projectId: raw.project.id,
    projectName: raw.project.name,
    tasksCount,
    createdByName: raw.createdBy?.name ?? "Unknown",
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}
