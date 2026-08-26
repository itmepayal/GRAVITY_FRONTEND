import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@/apis/workspace.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetWorkspaceProjectById = (
  workspaceId: string,
  projectId: string,
) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["project", workspaceId, projectId],
    queryFn: () => getProjectById(workspaceId, projectId),
    enabled:
      !!workspaceId && !!projectId && isAuthenticated && isAuthInitialized,
  });
};
