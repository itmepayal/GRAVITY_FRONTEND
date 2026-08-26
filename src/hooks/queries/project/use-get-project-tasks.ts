import { useQuery } from "@tanstack/react-query";
import { getProjectTasks } from "@/apis/project.api";
import { useAuthStore } from "@/store/auth.store";
import type { GetProjectTasksParams } from "@/types/project";

export const useGetProjectTasks = (
  projectId: string,
  params?: GetProjectTasksParams,
) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["project-tasks", projectId, params],
    queryFn: () => getProjectTasks(projectId, params),
    enabled: !!projectId && isAuthenticated && isAuthInitialized,
  });
};
