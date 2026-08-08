import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProject } from "@/apis/workspace.api";

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

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.workspaceId],
      });
    },
  });
};
