export type DepStatus = "done" | "active" | "blocked" | "pending";

export interface DepNode {
  id: string;
  x: number;
  y: number;
  label: string;
  status: DepStatus;
}

export type DepEdge = [string, string];

export type StatusColorMap = Record<DepStatus, string>;