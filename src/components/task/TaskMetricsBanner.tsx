import React from "react";
import { CheckCircle2, PlayCircle, Flame, Timer } from "lucide-react";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";

export interface TaskMetricsProps {
  metrics: {
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
    urgent: number;
    totalEst: number;
    totalAct: number;
  };
}

export const TaskMetricsBanner: React.FC<TaskMetricsProps> = ({ metrics }) => {
  const cards = [
    {
      title: "Total Tasks",
      value: metrics.total,
      subtitle: `${metrics.completed} completed (${metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%)`,
      icon: CheckCircle2,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "Active Progress",
      value: metrics.inProgress,
      subtitle: "Active engineering & review cycles",
      icon: PlayCircle,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Urgent / Blocked",
      value: `${metrics.blocked} / ${metrics.urgent}`,
      subtitle: metrics.blocked > 0 ? "Requires immediate attention!" : "No blocked tasks currently",
      icon: Flame,
      accentColor: "#DC2626",
      bgGradient: "from-red-50 to-transparent",
    },
    {
      title: "Work Hours Logged",
      value: `${metrics.totalAct}h / ${metrics.totalEst}h`,
      subtitle: "Logged work metrics across boards",
      icon: Timer,
      accentColor: "#2563EB",
      bgGradient: "from-[#2563EB]/10 to-transparent",
    },
  ];

  return <DashboardMetricsBanner cards={cards} />;
};
