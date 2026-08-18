import { createInviteLink } from "@/apis/invitation.api";
import type { CreateInviteLinkData } from "@/types/invitation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseCreateInviteLinkParams {
  workspaceId: string;
  data: CreateInviteLinkData;
}

export const useCreateInviteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: UseCreateInviteLinkParams) =>
      createInviteLink(workspaceId, data),

    onSuccess: (_, variables) => {
      toast.success("Invite link created successfully");

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
        error?.response?.data?.message || "Failed to create invite link",
      );
    },
  });
};
