import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignTask } from "@/apis/task.api";
import { toast } from "sonner";

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      assigneeId,
    }: {
      taskId: string;
      assigneeId: string;
    }) => assignTask(taskId, assigneeId),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Task assigned successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["board-tasks"],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to assign task.");
    },
  });
};
