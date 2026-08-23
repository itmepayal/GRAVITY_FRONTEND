import { useQuery } from "@tanstack/react-query";
import { getAnalyticsOverview } from "@/apis/analytics.api";
import type { GetAnalyticsQueryParams } from "@/types/analytics";

export const useGetAnalyticsOverview = (params: GetAnalyticsQueryParams) => {
  return useQuery({
    queryKey: ["analytics-overview", params],
    queryFn: () => getAnalyticsOverview(params),
    enabled: !!params.workspaceId,
    refetchInterval: 60000, // Refresh every 60s automatically
  });
};
