import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMilestone } from "@/apis/timeline.api";
import type { UpdateMilestoneInput } from "@/apis/timeline.api";
import { toast } from "sonner";

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      milestoneId,
      data,
    }: {
      milestoneId: string;
      data: UpdateMilestoneInput;
    }) => updateMilestone(milestoneId, data),
    onSuccess: () => {
      toast.success("Milestone updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["milestones"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update milestone",
      );
    },
  });
};
