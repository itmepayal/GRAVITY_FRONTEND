import { useQuery } from "@tanstack/react-query";
import { listBoards } from "@/apis/project.api";

export const useGetProjectBoards = (projectId: string) => {
  return useQuery({
    queryKey: ["project-boards", projectId],
    queryFn: () => listBoards(projectId),
    enabled: !!projectId,
  });
};
