import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkspace } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWorkspace,
    onSuccess: (response, variables) => {
      toast.success(response.message ?? "Workspace updated successfully");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to update workspace",
      );
    },
  });
};
