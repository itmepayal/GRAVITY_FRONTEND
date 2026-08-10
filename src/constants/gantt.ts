import type { GanttRow } from "@/types";

export const GANTT_ROWS: GanttRow[] = [
  {
    label: "Figma Hero & UI Design System",
    owner: "Aditi S.",
    color: "#0F2D29",
    start: 0,
    width: 20,
    critical: true,
  },
  {
    label: "AWS EKS CI/CD Pipeline Setup",
    owner: "Rohan M.",
    color: "#0F2D29",
    start: 15,
    width: 28,
    critical: true,
  },
  {
    label: "Stripe Webhook Retry Integration",
    owner: "Priya N.",
    color: "#E98A57",
    start: 22,
    width: 25,
  },
  {
    label: "Button & Modal Component Refactor",
    owner: "You (Dev)",
    color: "#0F2D29",
    start: 40,
    width: 32,
    critical: true,
  },
  {
    label: "WCAG 2.1 AA Accessibility Audit",
    owner: "Karan V.",
    color: "#8FE3C4",
    start: 68,
    width: 20,
    critical: true,
  },
  {
    label: "Headless CMS GraphQL Migration",
    owner: "Sara I.",
    color: "#5E6D68",
    start: 82,
    width: 18,
  },
];