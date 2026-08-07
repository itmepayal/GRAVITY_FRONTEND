import { useMutation } from "@tanstack/react-query";
import { updateWorkspace } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useUpdateWorkspace = () => {
  return useMutation({
    mutationFn: updateWorkspace,
    onSuccess: (data) => {
      console.log(data.message);
      toast.success(data.message ?? "Workspace updated successfully");
    },
    onError: (error: any) => {
      console.log(error.response);
      toast.error(
        error.response?.data?.message ?? "Failed to update workspace",
      );
    },
  });
};
