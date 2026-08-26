import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/apis/settings.api";
import { useAuthStore } from "@/store/auth.store";

export const useCurrentUser = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    enabled: isAuthenticated && isAuthInitialized,
  });
};
