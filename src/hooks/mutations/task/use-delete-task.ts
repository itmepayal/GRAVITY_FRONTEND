import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "@/apis/task.api";
import { toast } from "sonner";

import type { MessageResponse } from "@/types/task";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation<MessageResponse, Error, string>({
    mutationFn: (taskId) => deleteTask(taskId),

    onSuccess: (_, taskId) => {
      toast.success("Task deleted successfully");

      queryClient.removeQueries({
        queryKey: ["task", taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete task");
    },
  });
};
