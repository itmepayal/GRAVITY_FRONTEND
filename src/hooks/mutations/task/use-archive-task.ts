import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveTask } from "@/apis/task.api";
import { toast } from "sonner";

export const useArchiveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      isArchived,
    }: {
      taskId: string;
      isArchived?: boolean;
    }) => archiveTask(taskId, isArchived),
    onSuccess: (data) => {
      toast.success(data.message ?? "Task updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["archived-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to update task.");
    },
  });
};
