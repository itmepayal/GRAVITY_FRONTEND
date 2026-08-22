import { useQuery } from "@tanstack/react-query";

import { getProjectTasks } from "@/apis/task.api";

export const useGetProjectTasks = (projectId: string) => {
  return useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: () => getProjectTasks(projectId),
    enabled: !!projectId,
  });
};
