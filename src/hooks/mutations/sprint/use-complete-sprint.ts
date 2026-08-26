import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeSprint } from "@/apis/sprint.api";
import { toast } from "sonner";

export const useCompleteSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => completeSprint(sprintId),
    onSuccess: (data) => {
      toast.success(data.message ?? "Sprint completed successfully.");
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      queryClient.invalidateQueries({ queryKey: ["project-sprints"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to complete sprint.");
    },
  });
};
