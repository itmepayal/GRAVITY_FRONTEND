import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/apis/auth.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSuccess: (data) => {
      clearAuth();
      queryClient.clear();
      toast.success(data?.message ?? "Logged out successfully.");
      navigate("/login", { replace: true });
    },
    onError: (error: any) => {
      clearAuth();
      queryClient.clear();
      toast.error(error.response?.data?.message ?? "Logged out.");
      navigate("/login", { replace: true });
    },
  });
};
