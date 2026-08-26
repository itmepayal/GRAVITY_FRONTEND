import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProjectMemberRole } from "@/apis/project.api";
import { toast } from "sonner";

export const useUpdateProjectMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
      data,
    }: {
      projectId: string;
      userId: string;
      data: {
        roleId: string;
      };
    }) => updateProjectMemberRole(projectId, userId, data),

    onSuccess: (response, variables) => {
      toast.success(
        response.message ?? "Project member role updated successfully",
      );

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
        error?.response?.data?.message ||
          "Failed to update project member role",
      );
    },
  });
};
