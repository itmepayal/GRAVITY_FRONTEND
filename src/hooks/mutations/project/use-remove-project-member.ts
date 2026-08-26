import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeProjectMember } from "@/apis/project.api";
import { toast } from "sonner";

export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => removeProjectMember(projectId, userId),

    onSuccess: (response, variables) => {
      toast.success(response.message ?? "Project member removed successfully");

      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to remove project member",
      );
    },
  });
};
