import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMilestone } from "@/apis/timeline.api";
import { toast } from "sonner";

export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (milestoneId: string) => deleteMilestone(milestoneId),
    onSuccess: () => {
      toast.success("Milestone deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["milestones"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete milestone",
      );
    },
  });
};
