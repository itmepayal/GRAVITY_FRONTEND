import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateActualHours } from "@/apis/task.api";
import { toast } from "sonner";

export const useUpdateActualHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      actualHours,
    }: {
      taskId: string;
      actualHours: number;
    }) => updateActualHours(taskId, actualHours),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Actual hours updated successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["board-tasks"],
      });
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update actual hours.",
      );
    },
  });
};
