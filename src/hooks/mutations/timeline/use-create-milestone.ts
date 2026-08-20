import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMilestone } from "@/apis/timeline.api";
import type { CreateMilestoneInput } from "@/apis/timeline.api";
import { toast } from "sonner";

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMilestoneInput) => createMilestone(data),
    onSuccess: () => {
      toast.success("Milestone created successfully");
      queryClient.invalidateQueries({
        queryKey: ["milestones"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create milestone",
      );
    },
  });
};
