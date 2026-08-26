import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkspaceMemberRole } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useUpdateWorkspaceMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      userId,
      data,
    }: {
      workspaceId: string;
      userId: string;
      data: {
        roleId: string;
      };
    }) => updateWorkspaceMemberRole(workspaceId, userId, data),

    onSuccess: (response, variables) => {
      toast.success(response.message ?? "Member role updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["workspace-sharing", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update member role",
      );
    },
  });
};
