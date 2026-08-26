import { useMutation } from "@tanstack/react-query";
import { resendVerificationEmail } from "@/apis/auth.api";
import { toast } from "sonner";

export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: resendVerificationEmail,

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message);
    },
  });
};
