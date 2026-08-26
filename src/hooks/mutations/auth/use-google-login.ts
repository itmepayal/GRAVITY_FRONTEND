import { useMutation } from "@tanstack/react-query";
import { googleLogin } from "@/apis/auth.api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import type { LoginResponse } from "@/types/auth";

type GoogleLoginResult =
  | { type: "success"; response: LoginResponse }
  | { type: "twoFA"; response: LoginResponse };

export const useGoogleLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (idToken: string): Promise<GoogleLoginResult> => {
      const response = await googleLogin(idToken);

      if (response.data.requiresTwoFA) {
        return { type: "twoFA", response };
      }

      const { user, accessToken, refreshToken } = response.data;
      if (!user || !accessToken || !refreshToken) {
        throw new Error("Invalid login response.");
      }

      setAuth(user, accessToken, refreshToken);
      return { type: "success", response };
    },
    onSuccess: (result) => {
      if (result.type === "success") {
        toast.success(result.response.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Google login failed.");
    },
  });
};
