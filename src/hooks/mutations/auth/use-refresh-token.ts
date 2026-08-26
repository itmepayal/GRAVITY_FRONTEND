import { useMutation } from "@tanstack/react-query";
import { refreshToken } from "@/apis/auth.api";
import { useAuthStore } from "@/store/auth.store";
import type { RefreshTokenResponse } from "@/types/auth";

export const useRefreshToken = () => {
  const updateTokens = useAuthStore((s) => s.updateTokens);

  return useMutation({
    mutationFn: (token: string) => refreshToken(token),
    onSuccess: (response: RefreshTokenResponse) => {
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      updateTokens(accessToken, newRefreshToken);
    },
  });
};
