import React from "react";
import { FolderKanban, Zap, CheckCircle2, Users } from "lucide-react";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";

export interface ProjectMetricsBannerProps {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalMembers: number;
}

export const ProjectMetricsBanner: React.FC<ProjectMetricsBannerProps> = ({
  totalProjects,
  activeProjects,
  completedProjects,
  totalMembers,
}) => {
  const cards = [
    {
      title: "Total Projects",
      value: totalProjects,
      subtitle: "Across all workspaces",
      icon: FolderKanban,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "Active Delivery",
      value: activeProjects,
      subtitle: "In progress & planning",
      icon: Zap,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Completed",
      value: completedProjects,
      subtitle: "Successfully shipped",
      icon: CheckCircle2,
      accentColor: "#2563EB",
      bgGradient: "from-[#2563EB]/10 to-transparent",
    },
    {
      title: "Assigned Teammates",
      value: totalMembers,
      subtitle: "Active project contributors",
      icon: Users,
      accentColor: "#D97706",
      bgGradient: "from-[#D97706]/10 to-transparent",
    },
  ];

  return <DashboardMetricsBanner cards={cards} />;
};
