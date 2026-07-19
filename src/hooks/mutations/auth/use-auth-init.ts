import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { refreshToken as refreshTokenApi } from "@/apis/auth.api";

export function useAuthInit() {
  const [isChecking, setIsChecking] = useState(true);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    const restoreSession = async () => {
      const storedRefreshToken = useAuthStore.getState().refreshToken;
      if (!storedRefreshToken) {
        setIsChecking(false);
        return;
      }

      try {
        const { data } = await refreshTokenApi(storedRefreshToken);
        const { accessToken, refreshToken, user } = data;
        setAuth(user, accessToken, refreshToken);
      } catch {
        clearAuth();
      } finally {
        setIsChecking(false);
      }
    };

    restoreSession();
  }, [setAuth, clearAuth]);

  return isChecking;
}
