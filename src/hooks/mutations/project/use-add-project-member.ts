import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProjectMember } from "@/apis/project.api";
import { toast } from "sonner";

export const useAddProjectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: {
        userId: string;
        roleId: string;
      };
    }) => addProjectMember(projectId, data),

    onSuccess: (response, variables) => {
      toast.success(response.message ?? "Project member added successfully");

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
        error?.response?.data?.message || "Failed to add project member",
      );
    },
  });
};
