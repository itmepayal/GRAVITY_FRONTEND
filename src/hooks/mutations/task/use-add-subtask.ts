import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSubTask } from "@/apis/task.api";
import type { SubTaskData } from "@/types/task";
import { toast } from "sonner";

export const useAddSubTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: SubTaskData }) =>
      addSubTask(taskId, data),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Subtask added successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add subtask.");
    },
  });
};
