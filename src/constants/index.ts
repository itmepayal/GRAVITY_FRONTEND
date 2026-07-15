import type { ElementType } from "react";
import { GitBranch, Clock, Users, Workflow } from "lucide-react";
import type { DepEdge, DepNode, DepStatus, StatusColorMap } from "@/types";

export const NAV_LINKS: [string, string][] = [
  ["product", "Product"],
  ["solutions", "Solutions"],
  ["templates", "Templates"],
  ["pricing", "Pricing"],
  ["enterprise", "Enterprise"],
  ["resources", "Resources"],
];

export const DEP_NODES = [
  { id: "a", label: "Schema", x: 8, y: 50, status: "done" },
  { id: "b", label: "Auth service", x: 32, y: 20, status: "done" },
  { id: "c", label: "Billing API", x: 32, y: 78, status: "active" },
  { id: "d", label: "Web client", x: 58, y: 50, status: "active" },
  { id: "e", label: "Mobile client", x: 58, y: 88, status: "blocked" },
  { id: "f", label: "Launch", x: 86, y: 60, status: "pending" },
];

export const DEP_EDGES = [
  ["a", "b"],
  ["a", "c"],
  ["b", "d"],
  ["c", "d"],
  ["c", "e"],
  ["d", "f"],
  ["e", "f"],
];

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
  { value: "3.2M", label: "Dependencies tracked", icon: GitBranch },
  { value: "41%", label: "Fewer schedule slips", icon: Clock },
  { value: "12,400", label: "Teams onboarded", icon: Users },
  { value: "98.7%", label: "Uptime, last 12 months", icon: Workflow },
];
