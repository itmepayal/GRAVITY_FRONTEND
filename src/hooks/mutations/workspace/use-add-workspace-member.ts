import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmailInvitation } from "@/apis/invitation.api";
import { toast } from "sonner";

export const useAddWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: {
        email: string;
        roleId: string;
      };
    }) => createEmailInvitation(workspaceId, data),
    onSuccess: (data, variables) => {
      toast.success(data.message ?? "Invitation sent successfully");

      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-invitations", variables.workspaceId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to send workspace invitation",
      );
    },
  });
};
