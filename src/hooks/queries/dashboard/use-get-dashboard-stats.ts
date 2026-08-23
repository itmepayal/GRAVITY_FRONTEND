import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/apis/dashboard.api";

export const useGetDashboardStats = (workspaceId?: string) => {
  return useQuery({
    queryKey: ["dashboard-stats", workspaceId],
    queryFn: () => getDashboardStats(workspaceId),
  });
};
