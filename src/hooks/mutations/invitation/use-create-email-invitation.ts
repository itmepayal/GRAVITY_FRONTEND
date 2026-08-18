import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEmailInvitation } from "@/apis/invitation.api";
import type { CreateEmailInvitationData } from "@/types/invitation";

interface UseCreateEmailInvitationParams {
  workspaceId: string;
  data: CreateEmailInvitationData;
}

export const useCreateEmailInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: UseCreateEmailInvitationParams) =>
      createEmailInvitation(workspaceId, data),

    onSuccess: (_, variables) => {
      toast.success("Invitation sent successfully");

      queryClient.invalidateQueries({
        queryKey: ["workspace-invitations", variables.workspaceId],
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
        error?.response?.data?.message || "Failed to send invitation",
      );
    },
  });
};
