import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInviteLink } from "@/apis/invitation.api";
import { toast } from "sonner";

export const useRegenerateInviteCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => createInviteLink(workspaceId, {}),
    onSuccess: (response, workspaceId) => {
      toast.success(response.message ?? "Workspace invite link generated");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace-invitations", workspaceId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          "Failed to regenerate workspace invite link",
      );
    },
  });
};
