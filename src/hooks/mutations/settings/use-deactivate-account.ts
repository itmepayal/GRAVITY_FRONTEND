import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { deactivateAccount } from "@/apis/user.api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import type { AccountActionInput } from "@/types/user";

export const useDeactivateAccount = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: (data: AccountActionInput) => deactivateAccount(data),
    onSuccess: (data) => {
      clearAuth();
      queryClient.clear();
      toast.success(data.message);
      navigate("/login", { replace: true });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to deactivate account.",
      );
    },
  });
};
