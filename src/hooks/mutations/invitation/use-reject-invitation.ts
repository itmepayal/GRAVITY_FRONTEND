import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rejectInvitation } from "@/apis/invitation.api";

export const useRejectInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => rejectInvitation(token),

    onSuccess: (data) => {
      toast.success(data?.message || "Invitation rejected successfully");

      queryClient.invalidateQueries({
        queryKey: ["my-pending-invitations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["workspace-invitations"],
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to reject invitation",
      );
    },
  });
};
