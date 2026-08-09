import { useQuery } from "@tanstack/react-query";
import { getWorkspaceGoals } from "@/apis/goal.api";

export const useGetWorkspaceGoals = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-goals", workspaceId],
    queryFn: () => getWorkspaceGoals(workspaceId),
    enabled: !!workspaceId,
  });
};
