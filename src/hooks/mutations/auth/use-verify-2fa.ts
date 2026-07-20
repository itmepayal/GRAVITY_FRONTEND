import { useMutation } from "@tanstack/react-query";
import { verifyTwoFA } from "@/apis/auth.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

export const useVerifyTwoFA = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: verifyTwoFA,

    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(data.message);
      navigate("/");
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message);
    },
  });
};
