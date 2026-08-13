import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "@/apis/task.api";
import { toast } from "sonner";

import type { TaskResponse, UpdateTaskData } from "@/types/task";

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TaskResponse,
    Error,
    {
      taskId: string;
      data: UpdateTaskData | FormData;
    }
  >({
    mutationFn: ({ taskId, data }) => updateTask(taskId, data),

    onSuccess: (response, variables) => {
      toast.success(response?.message || "Task updated successfully");
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["board-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update task");
    },
  });
};
