import { useMutation } from "@tanstack/react-query";
import { verifyEmail } from "@/apis/auth.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

export const useVerifyEmail = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: verifyEmail,

    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data;

      if (user && accessToken && refreshToken) {
        setAuth(user, accessToken, refreshToken);
        toast.success(data.message);
        navigate("/dashboard");
        return;
      }

      toast.success(data.message);
      navigate("/login");
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message);
    },
  });
};
