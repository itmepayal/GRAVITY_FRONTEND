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

export interface GanttRow {
  label: string;
  owner: string;
  color: string;
  start: number;
  width: number;
  critical?: boolean;
}

export interface FeatureCard {
  icon: React.ElementType;
  tag: string;
  stat: string;
  title: string;
  description: string;
  accent: string;
}

export interface AutomationRule {
  trigger: string;
  action: string;
  icon: React.ElementType;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  dark?: boolean;
}