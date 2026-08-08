import { useQuery } from "@tanstack/react-query";
import { getWorkspaceProjects } from "@/apis/workspace.api";

export const useGetWorkspaceProjects = (workspaceId: string) => {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: () => getWorkspaceProjects(workspaceId),
    enabled: !!workspaceId,
  });
};
