import { useQuery } from "@tanstack/react-query";
import { getWorkspaceProjects } from "@/apis/workspace.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetWorkspaceProjects = (workspaceId: string) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: () => getWorkspaceProjects(workspaceId),
    enabled: !!workspaceId && isAuthenticated && isAuthInitialized,
  });
};
