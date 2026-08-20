import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regenerateInviteCode } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useRegenerateInviteCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => regenerateInviteCode(workspaceId),
    onSuccess: () => {
      toast.success("Workspace invite code regenerated successfully");
      queryClient.invalidateQueries({
        queryKey: ["user-workspaces"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to regenerate workspace invite code",
      );
    },
  });
};
