import { useQuery } from "@tanstack/react-query";
import { getProjectSprints } from "@/apis/project.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetProjectSprints = (projectId: string) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["project-sprints", projectId],
    queryFn: () => getProjectSprints(projectId),
    enabled: !!projectId && isAuthenticated && isAuthInitialized,
  });
};
