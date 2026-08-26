import { useQuery } from "@tanstack/react-query";
import { getWorkspaceTeams } from "@/apis/team.api";
import { useAuthStore } from "@/store/auth.store";
import type { GetWorkspaceTeamsParams } from "@/types/team";

export const useGetWorkspaceTeams = (
  workspaceId: string,
  params?: GetWorkspaceTeamsParams,
) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["workspace-teams", workspaceId, params],
    queryFn: () => getWorkspaceTeams(workspaceId, params),
    enabled: !!workspaceId && isAuthenticated && isAuthInitialized,
  });
};
