import { useQuery } from "@tanstack/react-query";
import { listAnalyticsSnapshots } from "@/apis/analytics.api";
import type { AnalyticsPeriod } from "@/types/analytics";

export const useGetAnalyticsSnapshots = (params: {
  workspaceId: string;
  projectId?: string;
  period?: AnalyticsPeriod;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["analytics-snapshots", params],
    queryFn: () => listAnalyticsSnapshots(params),
    enabled: !!params.workspaceId,
  });
};
