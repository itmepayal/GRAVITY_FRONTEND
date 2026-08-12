import { useQuery } from "@tanstack/react-query";
import { listBoards } from "@/apis/project.api";

export const useGetBoards = (projectId: string) => {
    return useQuery({
        queryKey: ["boards", projectId],
        queryFn: () => listBoards(projectId),
        enabled: !!projectId,
    });
};