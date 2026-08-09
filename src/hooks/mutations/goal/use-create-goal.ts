import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGoal } from "@/apis/goal.api";
import type { CreateGoalData } from "@/types/goal";
import { toast } from "sonner";

export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: CreateGoalData;
    }) => createGoal(workspaceId, data),

    onSuccess: (_, variables) => {
      toast.success("Goal created successfully");

      queryClient.invalidateQueries({
        queryKey: ["workspace-goals", variables.workspaceId],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create goal");
    },
  });
};
