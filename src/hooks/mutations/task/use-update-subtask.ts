import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSubTask } from "@/apis/task.api";
import type { SubTaskData } from "@/types/task";
import { toast } from "sonner";

export const useUpdateSubTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      subtaskId,
      data,
    }: {
      taskId: string;
      subtaskId: string;
      data: Partial<SubTaskData>;
    }) => updateSubTask(taskId, subtaskId, data),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Subtask updated successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update subtask.");
    },
  });
};
