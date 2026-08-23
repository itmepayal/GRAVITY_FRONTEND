import { useQuery } from "@tanstack/react-query";
import { getWorkspaceBilling } from "@/apis/billing.api";

export const useGetWorkspaceBilling = (workspaceId: string) => {
  return useQuery({
    queryKey: ["billing", workspaceId],
    queryFn: () => getWorkspaceBilling(workspaceId),
    enabled: !!workspaceId,
  });
};
