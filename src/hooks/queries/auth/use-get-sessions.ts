import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/apis/auth.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetSessions = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["auth-sessions"],
    queryFn: async () => {
      const response = await getSessions();
      return response.data;
    },
    enabled: isAuthenticated && isAuthInitialized,
  });
};
