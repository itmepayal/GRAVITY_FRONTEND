import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revokeInvitation } from "@/apis/invitation.api";

interface UseRevokeInvitationParams {
  workspaceId: string;
  invitationId: string;
}

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, invitationId }: UseRevokeInvitationParams) =>
      revokeInvitation(workspaceId, invitationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-invitations", variables.workspaceId],
      });
    },
  });
};
