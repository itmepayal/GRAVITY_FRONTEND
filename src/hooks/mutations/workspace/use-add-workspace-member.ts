import { useMutation } from "@tanstack/react-query";
import { addWorkspaceMember } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useAddWorkspaceMember = () => {
  return useMutation({
    mutationFn: addWorkspaceMember,
    onSuccess: (data) => {
      console.log(data.message);
      toast.success(data.message ?? "Member added successfully");
    },
    onError: (error: any) => {
      console.log(error.response);
      toast.error(
        error.response?.data?.message ?? "Failed to add workspace member",
      );
    },
  });
};
