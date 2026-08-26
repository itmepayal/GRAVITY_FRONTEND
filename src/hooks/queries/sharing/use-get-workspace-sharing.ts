import { useQuery } from "@tanstack/react-query";
import { getWorkspaceSharing } from "@/apis/sharing.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetWorkspaceSharing = (workspaceId: string) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["workspace-sharing", workspaceId],
    queryFn: () => getWorkspaceSharing(workspaceId),
    enabled: !!workspaceId && isAuthenticated && isAuthInitialized,
  });
};
