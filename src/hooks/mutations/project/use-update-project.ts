import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      data,
    }: {
      workspaceId: string;
      projectId: string;
      data: {
        name?: string;
        description?: string;
      };
    }) => updateProject(workspaceId, projectId, data),

    onSuccess: (_, variables) => {
      toast.success("Project updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["project", variables.workspaceId, variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.workspaceId],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update project");
    },
  });
};
