import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeProfile } from "@/apis/settings.api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

export const useChangeProfile = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: changeProfile,
    onSuccess: (data) => {
      updateUser(data.data);
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to update profile.");
    },
  });
};
