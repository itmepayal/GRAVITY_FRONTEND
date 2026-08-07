import { useMutation } from "@tanstack/react-query";
import { removeWorkspaceMember } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useRemoveWorkspaceMember = () => {
  return useMutation({
    mutationFn: removeWorkspaceMember,
    onSuccess: (data) => {
      console.log(data.message);
      toast.success(data.message ?? "Workspace member removed successfully");
    },
    onError: (error: any) => {
      console.log(error.response);
      toast.error(
        error.response?.data?.message ?? "Failed to remove workspace member",
      );
    },
  });
};
