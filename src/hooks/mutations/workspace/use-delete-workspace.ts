import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkspace } from "@/apis/workspace.api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { toast } from "sonner";

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspaceStore();

  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: (response, workspaceId) => {
      toast.success(response.message ?? "Workspace deleted successfully");
      if (currentWorkspaceId === workspaceId) {
        setCurrentWorkspaceId("");
      }
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.removeQueries({ queryKey: ["workspace", workspaceId] });
      queryClient.removeQueries({ queryKey: ["projects", workspaceId] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to delete workspace",
      );
    },
  });
};
