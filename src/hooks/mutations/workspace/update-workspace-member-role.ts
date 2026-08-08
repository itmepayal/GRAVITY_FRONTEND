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
        role: string;
      };
    }) => updateWorkspaceMemberRole(workspaceId, userId, data),

    onSuccess: () => {
      toast.success("Member role updated successfully");

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
