import { useMutation } from "@tanstack/react-query";
import { createWorkspace } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: (data) => {
      console.log(data.message);
      toast.success(data.message ?? "Workspace created successfully");
    },
    onError: (error: any) => {
      console.log(error.response);
      toast.error(
        error.response?.data?.message ?? "Failed to create workspace",
      );
    },
  });
};
