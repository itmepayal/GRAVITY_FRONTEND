import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/apis/user.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetAllUsers = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
    enabled: isAuthenticated && isAuthInitialized,
  });
};
