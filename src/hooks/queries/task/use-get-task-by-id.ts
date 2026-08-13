import { useQuery } from "@tanstack/react-query";
import { getTaskById } from "@/apis/task.api";
import type { TaskResponse } from "@/types/task";

export const useGetTaskById = (taskId: string) => {
  return useQuery<TaskResponse, Error>({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
  });
};
