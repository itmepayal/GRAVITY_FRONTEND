import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWorkspaceMember } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useAddWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addWorkspaceMember,
    onSuccess: (data, variables) => {
      toast.success(data.message ?? "Member added successfully");

      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to add workspace member",
      );
    },
  });
};
