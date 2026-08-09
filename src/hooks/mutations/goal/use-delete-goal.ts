import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGoal } from "@/apis/goal.api";
import { toast } from "sonner";

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onSuccess: (_, goalId) => {
      toast.success("Goal deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["goal", goalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-goals"],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete goal");
    },
  });
};
