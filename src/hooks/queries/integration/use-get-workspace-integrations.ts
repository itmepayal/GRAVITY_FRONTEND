import { useQuery } from "@tanstack/react-query";
import { listWorkspaceIntegrations } from "@/apis/integration.api";
import type { ListIntegrationsQueryParams } from "@/types/integration";

export const useGetWorkspaceIntegrations = (params: ListIntegrationsQueryParams) => {
  return useQuery({
    queryKey: ["integrations", params],
    queryFn: () => listWorkspaceIntegrations(params),
    enabled: !!params.workspaceId,
  });
};
