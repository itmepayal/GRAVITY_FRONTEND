import { useMutation } from "@tanstack/react-query";
import { disableTwoFA } from "@/apis/auth.api";
import { toast } from "sonner";

export const useDisableTwoFA = () => {
  return useMutation({
    mutationFn: disableTwoFA,

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message);
    },
  });
};
