import { useQuery } from "@tanstack/react-query";
import { getWorkspaceById } from "@/apis/workspace.api";

export const useGetWorkspaceById = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceById(workspaceId),
    enabled: !!workspaceId,
  });
};
