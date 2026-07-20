import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeProfile } from "@/apis/user.api";
import { toast } from "sonner";

export const useChangeProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeProfile,
    onSuccess: (data) => {
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
