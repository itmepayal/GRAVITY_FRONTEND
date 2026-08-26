import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { refreshToken as refreshTokenApi } from "@/apis/auth.api";
import { getCurrentUser } from "@/apis/user.api";

export function useAuthInit() {
  const setAuthInitialized = useAuthStore((s) => s.setAuthInitialized);
  const updateTokens = useAuthStore((s) => s.updateTokens);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  useEffect(() => {
    if (isAuthInitialized) return;

    const restoreSession = async () => {
      const { refreshToken: storedRefreshToken, user: storedUser } =
        useAuthStore.getState();

      if (!storedRefreshToken) {
        setAuthInitialized(true);
        return;
      }

      try {
        const { data } = await refreshTokenApi(storedRefreshToken);
        updateTokens(data.accessToken, data.refreshToken);

        try {
          const currentUser = await getCurrentUser();
          updateUser(currentUser);
        } catch {
          if (storedUser) {
            updateUser(storedUser);
          }
        }
      } catch {
        clearAuth();
      } finally {
        setAuthInitialized(true);
      }
    };

    restoreSession();
  }, [
    isAuthInitialized,
    setAuthInitialized,
    updateTokens,
    updateUser,
    clearAuth,
  ]);

  return !isAuthInitialized;
}
