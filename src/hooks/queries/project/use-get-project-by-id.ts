import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@/apis/workspace.api";

export const useGetProjectById = (workspaceId: string, projectId: string) => {
  return useQuery({
    queryKey: ["project", workspaceId, projectId],
    queryFn: () => getProjectById(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });
};
