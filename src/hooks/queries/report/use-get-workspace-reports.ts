import { useQuery } from "@tanstack/react-query";
import { listReports } from "@/apis/report.api";
import type { ListReportsQueryParams } from "@/types/report";

export const useGetWorkspaceReports = (params: ListReportsQueryParams) => {
  return useQuery({
    queryKey: ["workspace-reports", params],
    queryFn: () => listReports(params),
    enabled: !!params.workspaceId,
  });
};
