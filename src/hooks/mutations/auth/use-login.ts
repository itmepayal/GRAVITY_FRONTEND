import { useMutation } from "@tanstack/react-query";
import { login } from "@/apis/auth.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data?.data?.requiresTwoFA) {
        return;
      }
      toast.success(data.message);
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      navigate("/");
    },
    onError: (error: any) => {
      console.log(error.response);
      toast.error(error.response?.data?.message ?? "Login failed");
    },
  });
};
