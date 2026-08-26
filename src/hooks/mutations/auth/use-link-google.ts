import { useMutation, useQueryClient } from "@tanstack/react-query";
import { linkGoogleAccount } from "@/apis/auth.api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

export const useLinkGoogleAccount = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (idToken: string) => linkGoogleAccount(idToken),
    onSuccess: (data) => {
      updateUser(data.data);
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to link Google account.",
      );
    },
  });
};
