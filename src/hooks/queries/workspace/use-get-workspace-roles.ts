import { useQuery } from "@tanstack/react-query";
import { getWorkspaceRoles } from "@/apis/workspace.api";

export const useGetWorkspaceRoles = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-roles", workspaceId],
    queryFn: () => getWorkspaceRoles(workspaceId),
    enabled: !!workspaceId,
  });
};
