import type { ElementType } from "react";
import { GitBranch, Users, Kanban, CheckCircle2 } from "lucide-react";
import type { DepEdge, DepNode, DepStatus, StatusColorMap } from "@/types";
import {
  TMS_STATS,
  TASK_DEP_NODES,
  TASK_DEP_EDGES,
} from "@/constants/task/landingData";

export const NAV_LINKS: [string, string][] = [
  ["product", "Product"],
  ["solutions", "Solutions"],
  ["templates", "Templates"],
  ["pricing", "Pricing"],
  ["enterprise", "Enterprise"],
  ["resources", "Resources"],
];


export const DEP_NODES = TASK_DEP_NODES;

export const DEP_EDGES = TASK_DEP_EDGES;

export const STATUS_COLOR = {
  done: "#3FA787",
  active: "#8FE3C4",
  blocked: "#E98A57",
  pending: "rgba(255,255,255,0.25)",
};

export const NODES = DEP_NODES as DepNode[];
export const EDGES = DEP_EDGES as DepEdge[];
export const COLORS = STATUS_COLOR as StatusColorMap;
export const STATUS_LIST: DepStatus[] = ["done", "active", "blocked", "pending"];



export interface Stat {
  value: string;
  label: string;
  icon: ElementType;
}

export const STATS: Stat[] = [
  {
    value: `${TMS_STATS.totalTasks}+`,
    label: "Tasks tracked per sprint",
    icon: Kanban,
  },
  {
    value: `${TMS_STATS.activeTasks}`,
    label: "Active in-progress tasks",
    icon: GitBranch,
  },
  {
    value: `${TMS_STATS.teamMembers}`,
    label: "Team members onboarded",
    icon: Users,
  },
  {
    value: `${TMS_STATS.completedTasks}`,
    label: "Tasks shipped this sprint",
    icon: CheckCircle2,
  },
];

export const LOGOS = [
  "Atlas",
  "Harbor",
  "Beacon",
  "Northwind",
  "Fathom",
  "Loop",
  "Cascade",
  "Marlin",
];

export const TRACK_W = 42;
export const TRACK_H = 22;
export const THUMB = 18;
export const PAD = 2;
 

export const AUTOPLAY_MS = 5500;