import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProject } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
    }: {
      workspaceId: string;
      projectId: string;
    }) => deleteProject(workspaceId, projectId),

    onSuccess: (response, variables) => {
      toast.success(response.message ?? "Project deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.removeQueries({
        queryKey: ["project", variables.workspaceId, variables.projectId],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete project");
    },
  });
};
