import { getWorkspaceTeams } from "@/apis/team.api";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaceTeams = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-teams", workspaceId],
    queryFn: () => getWorkspaceTeams(workspaceId),
    enabled: !!workspaceId,
  });
};
