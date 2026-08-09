import { useQuery } from "@tanstack/react-query";
import { getProjectSprints } from "@/apis/project.api";

export const useGetProjectSprints = (projectId: string) => {
  return useQuery({
    queryKey: ["project-sprints", projectId],
    queryFn: () => getProjectSprints(projectId),
    enabled: !!projectId,
  });
};
