import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGoal } from "@/apis/goal.api";
import { toast } from "sonner";
import type { UpdateGoalData } from "@/types/goal";

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: UpdateGoalData }) =>
      updateGoal(goalId, data),

    onSuccess: (_, variables) => {
      toast.success("Goal updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["goal", variables.goalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-goals"],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update goal");
    },
  });
};
