import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enableTwoFA } from "@/apis/auth.api";
import { toast } from "sonner";

export const useEnableTwoFA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enableTwoFA,

    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to enable 2FA.");
    },
  });
};
