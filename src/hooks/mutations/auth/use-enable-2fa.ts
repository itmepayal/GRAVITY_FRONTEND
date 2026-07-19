import { useMutation } from "@tanstack/react-query";
import { enableTwoFA } from "@/apis/auth.api";
import { toast } from "sonner";

export const useEnableTwoFA = () => {
  return useMutation({
    mutationFn: enableTwoFA,

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message);
    },
  });
};
