import React from "react";
import { Kanban, LayoutGrid, ListTodo, Columns3 } from "lucide-react";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";

export interface BoardMetricsBannerProps {
  totalBoards: number;
  kanbanBoards: number;
  scrumBoards: number;
  totalTasks: number;
}

export const BoardMetricsBanner: React.FC<BoardMetricsBannerProps> = ({
  totalBoards,
  kanbanBoards,
  scrumBoards,
  totalTasks,
}) => {
  const cards = [
    {
      title: "Total Boards",
      value: totalBoards,
      subtitle: "Across all projects",
      icon: Kanban,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "Kanban Boards",
      value: kanbanBoards,
      subtitle: "Continuous flow workflows",
      icon: Columns3,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Scrum Boards",
      value: scrumBoards,
      subtitle: "Sprint-based delivery",
      icon: LayoutGrid,
      accentColor: "#2563EB",
      bgGradient: "from-[#2563EB]/10 to-transparent",
    },
    {
      title: "Tasks on Boards",
      value: totalTasks,
      subtitle: "Active tracked work items",
      icon: ListTodo,
      accentColor: "#D97706",
      bgGradient: "from-[#D97706]/10 to-transparent",
    },
  ];

  return <DashboardMetricsBanner cards={cards} />;
};
