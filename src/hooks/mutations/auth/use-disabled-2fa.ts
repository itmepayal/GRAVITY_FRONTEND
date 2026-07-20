import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disableTwoFA } from "@/apis/auth.api";
import { toast } from "sonner";

export const useDisableTwoFA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disableTwoFA,

    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to disable 2FA.");
    },
  });
};
