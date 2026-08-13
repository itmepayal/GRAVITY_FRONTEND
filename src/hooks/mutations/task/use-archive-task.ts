import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveTask } from "@/apis/task.api";
import { toast } from "sonner";

export const useArchiveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => archiveTask(taskId),

    onSuccess: (response, taskId) => {
      toast.success(response.message || "Task archived successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["board-tasks"],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to archive task.");
    },
  });
};
