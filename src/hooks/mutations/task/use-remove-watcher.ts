import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeWatcher } from "@/apis/task.api";
import { toast } from "sonner";

export const useRemoveWatcher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      removeWatcher(taskId, userId),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Watcher removed successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove watcher.");
    },
  });
};
