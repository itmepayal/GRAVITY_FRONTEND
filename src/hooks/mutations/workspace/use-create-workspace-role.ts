import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkspaceRole } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useCreateWorkspaceRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: {
        name: string;
        permissions: string[];
      };
    }) => createWorkspaceRole(workspaceId, data),
    onSuccess: (_, variables) => {
      toast.success("Workspace role created successfully");
      queryClient.invalidateQueries({
        queryKey: ["workspace-roles", variables.workspaceId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create workspace role",
      );
    },
  });
};
