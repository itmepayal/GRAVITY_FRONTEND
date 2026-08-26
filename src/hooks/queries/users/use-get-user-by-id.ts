import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/apis/user.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetUserById = (userId: string) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: Boolean(userId) && isAuthenticated && isAuthInitialized,
  });
};
