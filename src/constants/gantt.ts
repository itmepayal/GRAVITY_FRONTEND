import type { GanttRow } from "@/types";

export const GANTT_ROWS: GanttRow[] = [
  {
    label: "Discovery & scoping",
    owner: "PM",
    color: "#5E6D68",
    start: 0,
    width: 16,
  },
  {
    label: "API schema design",
    owner: "ENG",
    color: "#3FA787",
    start: 12,
    width: 22,
    critical: true,
  },
  {
    label: "Design system pass",
    owner: "DES",
    color: "#E98A57",
    start: 14,
    width: 18,
  },
  {
    label: "Build core services",
    owner: "ENG",
    color: "#3FA787",
    start: 34,
    width: 30,
    critical: true,
  },
  {
    label: "Integration testing",
    owner: "QA",
    color: "#8FE3C4",
    start: 62,
    width: 20,
    critical: true,
  },
  {
    label: "Staged rollout",
    owner: "OPS",
    color: "#5E6D68",
    start: 80,
    width: 16,
  },
];