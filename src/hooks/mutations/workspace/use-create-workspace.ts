import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkspace } from "@/apis/workspace.api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { toast } from "sonner";

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const setCurrentWorkspaceId = useWorkspaceStore((s) => s.setCurrentWorkspaceId);

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: (response) => {
      const workspaceId = response.data._id ?? response.data.id;
      if (workspaceId) {
        setCurrentWorkspaceId(workspaceId);
      }
      toast.success(response.message ?? "Workspace created successfully");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to create workspace",
      );
    },
  });
};
