import { getWorkspaceRoles } from "@/apis/role.api";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaceRoles = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-roles", workspaceId],
    queryFn: () => getWorkspaceRoles(workspaceId),
    enabled: !!workspaceId,
  });
};
