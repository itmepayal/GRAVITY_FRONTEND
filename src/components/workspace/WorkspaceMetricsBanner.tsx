import React from "react";
import { Building2, Layers, Users, Target } from "lucide-react";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";

export interface WorkspaceMetricsProps {
  totalWorkspaces: number;
  totalProjects: number;
  totalMembers: number;
  totalGoals: number;
}

export const WorkspaceMetricsBanner: React.FC<WorkspaceMetricsProps> = ({
  totalWorkspaces,
  totalProjects,
  totalMembers,
  totalGoals,
}) => {
  const cards = [
    {
      title: "Active Workspaces",
      value: totalWorkspaces,
      subtitle: "Enterprise organization spaces",
      icon: Building2,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "Active Projects",
      value: totalProjects,
      subtitle: "Cross-team project repositories",
      icon: Layers,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Total Teammates",
      value: totalMembers,
      subtitle: "Assigned workspace members",
      icon: Users,
      accentColor: "#2563EB",
      bgGradient: "from-[#2563EB]/10 to-transparent",
    },
    {
      title: "Quarterly Goals",
      value: totalGoals,
      subtitle: "Tracked strategic objectives",
      icon: Target,
      accentColor: "#D97706",
      bgGradient: "from-[#D97706]/10 to-transparent",
    },
  ];

  return <DashboardMetricsBanner cards={cards} />;
};
