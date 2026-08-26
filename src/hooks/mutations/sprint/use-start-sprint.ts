import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startSprint } from "@/apis/sprint.api";
import { toast } from "sonner";

export const useStartSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => startSprint(sprintId),
    onSuccess: (data) => {
      toast.success(data.message ?? "Sprint started successfully.");
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      queryClient.invalidateQueries({ queryKey: ["project-sprints"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to start sprint.");
    },
  });
};
