import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveTask } from "@/apis/task.api";
import { toast } from "sonner";

interface MoveTaskData {
  boardId?: string;
  column?: string;
  status?: string;
}

export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: MoveTaskData }) =>
      moveTask(taskId, data),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Task moved successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["board-tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to move task.");
    },
  });
};
