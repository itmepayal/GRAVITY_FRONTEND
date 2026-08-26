import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/apis/settings.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetSessions = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  return useQuery({
    queryKey: ["auth-sessions", refreshToken],
    queryFn: async () => {
      const response = await getSessions(refreshToken ?? undefined);
      return response.data;
    },
    enabled: isAuthenticated && isAuthInitialized,
  });
};
