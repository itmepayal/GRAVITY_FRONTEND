import { useQuery } from "@tanstack/react-query";
import { listBoards } from "@/apis/project.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetProjectBoards = (projectId: string) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["project-boards", projectId],
    queryFn: () => listBoards(projectId),
    enabled: !!projectId && isAuthenticated && isAuthInitialized,
  });
};
