import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWatcher } from "@/apis/task.api";
import { toast } from "sonner";

export const useAddWatcher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      addWatcher(taskId, userId),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Watcher added successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add watcher.");
    },
  });
};
