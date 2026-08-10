import type { FeatureCard } from "@/types";
import {
  Kanban,
  GitBranch,
  Workflow,
  Users,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const FEATURES: FeatureCard[] = [
  {
    icon: Kanban,
    tag: "Agile Task Management",
    stat: "Multi-View Boards",
    title: "Kanban, Table & Grid Layouts",
    description:
      "Seamlessly toggle between visual Kanban columns, structured data tables, and compact card grids to manage engineering tasks with maximum velocity.",
    accent: "#0F2D29",
  },
  {
    icon: GitBranch,
    tag: "Dependency Tracking",
    stat: "Critical Path AI",
    title: "Dependency Graph & Blockers",
    description:
      "Link related tasks across workspaces. Automatically highlight critical paths and notify assignees the moment upstream blockers are resolved.",
    accent: "#0F2D29",
  },
  {
    icon: Workflow,
    tag: "Workflow Automation",
    stat: "Custom Rule Engine",
    title: "Zero-Code Automation Rules",
    description:
      "Auto-assign tasks, send Slack alerts, update sprint progress, and trigger status transitions when pull requests or subtasks complete.",
    accent: "#E98A57",
  },
  {
    icon: Users,
    tag: "Resource Management",
    stat: "5-Week Forecast",
    title: "Team Capacity & Workload Balance",
    description:
      "Monitor developer capacity, prevent burnout, and balance workload distribution across sprints before deadlines are missed.",
    accent: "#0F2D29",
  },
  {
    icon: Clock,
    tag: "Time & Work Logs",
    stat: "Granular Tracking",
    title: "Subtasks Checklist & Hour Metrics",
    description:
      "Break complex epics into subtasks, log actual vs estimated hours, and generate accurate velocity reports for sprint retrospectives.",
    accent: "#0F2D29",
  },
  {
    icon: ShieldCheck,
    tag: "Enterprise RBAC",
    stat: "SOC2 Compliant",
    title: "Workspaces & Granular Access",
    description:
      "Isolate projects across multi-tenant workspaces with role-based access control (RBAC), audit logging, and encrypted attachment storage.",
    accent: "#0F2D29",
  },
];