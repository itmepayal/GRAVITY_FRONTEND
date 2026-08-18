import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { acceptInvitation } from "@/apis/invitation.api";

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => acceptInvitation(token),

    onSuccess: (data) => {
      toast.success(data?.message || "Invitation accepted successfully");

      queryClient.invalidateQueries({
        queryKey: ["my-pending-invitations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });

      queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to accept invitation",
      );
    },
  });
};
