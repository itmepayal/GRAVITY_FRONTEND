import { api } from "@/lib/api";
import type { IDashboardStats } from "@/types/dashboard";

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: IDashboardStats;
}

export const getDashboardStats = async (
  workspaceId?: string
): Promise<DashboardStatsResponse> => {
  const response = await api.get<DashboardStatsResponse>("/dashboard/stats", {
    params: { workspaceId },
  });
  return response.data;
};
