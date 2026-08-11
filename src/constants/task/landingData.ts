import { INITIAL_TASKS, PROJECTS, BOARDS, USERS } from "./mockData";
import type { GanttRow } from "@/types";

/** Landing-page stats derived from Task Management mock data */
export const TMS_STATS = {
  totalTasks: INITIAL_TASKS.length,
  activeTasks: INITIAL_TASKS.filter((t) =>
    ["in_progress", "in_review", "testing"].includes(t.status),
  ).length,
  completedTasks: INITIAL_TASKS.filter((t) => t.status === "completed").length,
  workspaces: 3,
  projects: PROJECTS.length,
  teamMembers: USERS.length,
};

/** Gantt rows from real task titles in mockData */
export const GANTT_FROM_TASKS: GanttRow[] = [
  {
    label: INITIAL_TASKS[0].title,
    owner: "You (Dev)",
    color: "#0F2D29",
    start: 0,
    width: 22,
    critical: true,
  },
  {
    label: INITIAL_TASKS[1].title,
    owner: "Rohan M.",
    color: "#0F2D29",
    start: 12,
    width: 30,
    critical: true,
  },
  {
    label: INITIAL_TASKS[2].title,
    owner: "Priya N.",
    color: "#E98A57",
    start: 20,
    width: 24,
  },
  {
    label: INITIAL_TASKS[3].title,
    owner: "You (Dev)",
    color: "#0F2D29",
    start: 38,
    width: 28,
    critical: true,
  },
  {
    label: INITIAL_TASKS[4].title,
    owner: "Sara I.",
    color: "#8FE3C4",
    start: 55,
    width: 22,
    critical: true,
  },
  {
    label: INITIAL_TASKS[6].title,
    owner: "Priya N.",
    color: "#5E6D68",
    start: 78,
    width: 18,
  },
];

/** Dependency graph nodes mapped to sprint tasks */
export const TASK_DEP_NODES = [
  { id: "a", label: "Hero UI", x: 8, y: 50, status: "done" as const },
  { id: "b", label: "CI/CD", x: 32, y: 22, status: "done" as const },
  { id: "c", label: "Stripe API", x: 32, y: 78, status: "blocked" as const },
  { id: "d", label: "Design Sys", x: 58, y: 50, status: "active" as const },
  { id: "e", label: "A11y Audit", x: 58, y: 88, status: "pending" as const },
  { id: "f", label: "Sprint Ship", x: 86, y: 60, status: "pending" as const },
];

export const TASK_DEP_EDGES: [string, string][] = [
  ["a", "b"],
  ["a", "d"],
  ["b", "d"],
  ["c", "d"],
  ["d", "e"],
  ["d", "f"],
  ["e", "f"],
];

export const LANDING_BOARD = BOARDS[0];
export const LANDING_PROJECT = PROJECTS[0];
