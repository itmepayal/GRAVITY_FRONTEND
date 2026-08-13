import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSubTask } from "@/apis/task.api";
import { toast } from "sonner";

export const useDeleteSubTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      subtaskId,
    }: {
      taskId: string;
      subtaskId: string;
    }) => deleteSubTask(taskId, subtaskId),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Subtask deleted successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete subtask.");
    },
  });
};
