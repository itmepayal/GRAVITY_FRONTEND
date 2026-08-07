import { useMutation } from "@tanstack/react-query";
import { deleteWorkspace } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useDeleteWorkspace = () => {
  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: (data) => {
      console.log(data.message);
      toast.success(data.message ?? "Workspace deleted successfully");
    },
    onError: (error: any) => {
      console.log(error.response);
      toast.error(
        error.response?.data?.message ?? "Failed to delete workspace",
      );
    },
  });
};
