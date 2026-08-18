import { joinViaInviteCode } from "@/apis/invitation.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useJoinViaInviteCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => joinViaInviteCode(token),

    onSuccess: () => {
      toast.success("Joined workspace successfully");

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
      toast.error(error?.response?.data?.message || "Failed to join workspace");
    },
  });
};
