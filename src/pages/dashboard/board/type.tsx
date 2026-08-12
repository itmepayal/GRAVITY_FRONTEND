export const INK = "#0F2D29";
export const MINT = "#8FE3C4";
export const TEAL = "#0F8A65";

export type BoardType = "kanban" | "scrum";

export const BOARD_THEME: Record<
  BoardType,
  {
    accent: string;
    accentSoft: string;
    accentBorder: string;
    toolbarBg: string;
    badgeText: string;
  }
> = {
  kanban: {
    accent: INK,
    accentSoft: "#EDEBE3",
    accentBorder: `${INK}22`,
    toolbarBg: "white",
    badgeText: `${INK}99`,
  },
  scrum: {
    accent: TEAL,
    accentSoft: "#E7F5EF",
    accentBorder: `${TEAL}33`,
    toolbarBg: "#F4FBF8",
    badgeText: TEAL,
  },
};

export type Priority = "low" | "medium" | "high" | "urgent";

export const PRIORITY_META: Record<
  Priority,
  { label: string; color: string; bg: string }
> = {
  low: { label: "Low", color: INK, bg: "#EDEBE3" },
  medium: { label: "Medium", color: "#C2680B", bg: "#FDF1E4" },
  high: { label: "High", color: "#B3261E", bg: "#FBEAE9" },
  urgent: { label: "Urgent", color: "#B3261E", bg: "#FBEAE9" },
};

export const PRIORITY_ORDER: Priority[] = ["low", "medium", "high", "urgent"];

export type TagName = "Design" | "Frontend" | "Backend" | "Bug" | "Docs";

export const TAG_COLORS: Record<TagName, { color: string; bg: string }> = {
  Design: { color: "#3B5BDB", bg: "#EAF0FE" },
  Frontend: { color: TEAL, bg: "#E7F5EF" },
  Backend: { color: "#0B6E4F", bg: "#E4F5EC" },
  Bug: { color: "#B3261E", bg: "#FBEAE9" },
  Docs: { color: "#6A4EE0", bg: "#EFEBFC" },
};

export const ALL_TAGS: TagName[] = [
  "Design",
  "Frontend",
  "Backend",
  "Bug",
  "Docs",
];

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  tags: TagName[];
  assignee: string;
  comments: number;
  attachments: number;
  due: string | null;
  storyPoints?: number;
}

export const inputClass =
  "w-full border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0F2D29]/15";
