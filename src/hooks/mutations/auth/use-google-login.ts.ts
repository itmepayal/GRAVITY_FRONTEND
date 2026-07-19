import { useMutation } from "@tanstack/react-query";
import { googleLogin } from "@/apis/auth.api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

export const useGoogleLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (idToken: string) => googleLogin(idToken),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(response.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Google login failed.");
    },
  });
};
