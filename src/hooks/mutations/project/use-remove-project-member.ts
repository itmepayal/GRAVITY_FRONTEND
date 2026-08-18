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

    onSuccess: (_, variables) => {
      toast.success("Project member removed successfully");

      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to remove project member",
      );
    },
  });
};
