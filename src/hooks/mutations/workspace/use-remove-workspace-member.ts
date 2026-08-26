import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeWorkspaceMember } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useRemoveWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeWorkspaceMember,
    onSuccess: (data, variables) => {
      toast.success(data.message ?? "Workspace member removed successfully");

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
        error.response?.data?.message ?? "Failed to remove workspace member",
      );
    },
  });
};
