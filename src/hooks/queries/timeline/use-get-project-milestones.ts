import { useQuery } from "@tanstack/react-query";
import { getProjectMilestones } from "@/apis/timeline.api";

export const useGetProjectMilestones = (projectId: string) => {
  return useQuery({
    queryKey: ["milestones", projectId],
    queryFn: () => getProjectMilestones(projectId),
    enabled: !!projectId,
  });
};
