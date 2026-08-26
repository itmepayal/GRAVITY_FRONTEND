import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkspaceSharing } from "@/apis/sharing.api";
import type { UpdateWorkspaceSharingInput } from "@/types/sharing";
import { toast } from "sonner";

export const useUpdateWorkspaceSharing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: UpdateWorkspaceSharingInput;
    }) => updateWorkspaceSharing(workspaceId, data),

    onSuccess: (response, variables) => {
      toast.success(
        response.message ?? "Workspace sharing settings updated.",
      );

      queryClient.invalidateQueries({
        queryKey: ["workspace-sharing", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          "Failed to update workspace sharing settings.",
      );
    },
  });
};
