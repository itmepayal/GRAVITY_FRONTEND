import React from "react";
import { Users, Crown, Shield, Layers } from "lucide-react";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";

export interface TeamMetricsProps {
  totalTeams: number;
  totalMembers: number;
  totalLeads: number;
  totalWorkspaces: number;
}

export const TeamMetricsBanner: React.FC<TeamMetricsProps> = ({
  totalTeams,
  totalMembers,
  totalLeads,
  totalWorkspaces,
}) => {
  const cards = [
    {
      title: "Total Teams",
      value: totalTeams,
      subtitle: `${totalMembers} active team members`,
      icon: Users,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "Team Members",
      value: totalMembers,
      subtitle: "Across organization spaces",
      icon: Shield,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Team Leads",
      value: totalLeads,
      subtitle: "Assigned lead engineers & leads",
      icon: Crown,
      accentColor: "#D97706",
      bgGradient: "from-[#D97706]/10 to-transparent",
    },
    {
      title: "Workspaces",
      value: totalWorkspaces,
      subtitle: "Active workspace environments",
      icon: Layers,
      accentColor: "#2563EB",
      bgGradient: "from-[#2563EB]/10 to-transparent",
    },
  ];

  return <DashboardMetricsBanner cards={cards} />;
};
