import { useQuery } from "@tanstack/react-query";
import { getUserWorkspaces } from "@/apis/workspace.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetUserWorkspaces = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getUserWorkspaces(),
    enabled: isAuthenticated && isAuthInitialized,
  });
};
