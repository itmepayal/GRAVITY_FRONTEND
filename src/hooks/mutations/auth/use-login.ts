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
      toast.success(data.message);
      console.log("I am working");
      console.log(data.data);
      const { user, accessToken, refreshToken } = data.data;
      console.log({ user, accessToken, refreshToken });
      setAuth(user, accessToken, refreshToken);
      navigate("/");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Login failed");
    },
  });
};
