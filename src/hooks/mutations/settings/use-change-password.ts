import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/apis/user.api";
import { toast } from "sonner";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to change password.",
      );
    },
  });
};
