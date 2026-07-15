import type { FeatureCard } from "@/types";
import {
  GitBranch,
  Workflow,
  Users,
} from "lucide-react";

export const FEATURES: FeatureCard[] = [
  {
    icon: GitBranch,
    tag: "Task Dependencies",
    stat: "Smart Scheduling",
    title: "Track dependencies with confidence",
    description:
      "Link related tasks and visualize upstream and downstream dependencies. Timeline updates automatically whenever priorities or due dates change.",
    accent: "#3FA787",
  },
  {
    icon: Workflow,
    tag: "Workflow Automation",
    stat: "Custom Rules",
    title: "Automate repetitive project work",
    description:
      "Create automation for task assignments, status changes, reminders, approvals, and notifications to keep every project moving.",
    accent: "#E98A57",
  },
  {
    icon: Users,
    tag: "Team Management",
    stat: "Balanced Workloads",
    title: "Plan work around real team capacity",
    description:
      "Monitor workloads across your team, prevent over-assignment, and distribute tasks fairly with real-time capacity insights.",
    accent: "#5E6D68",
  },
];