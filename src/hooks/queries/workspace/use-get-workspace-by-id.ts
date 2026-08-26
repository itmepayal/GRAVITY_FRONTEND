import { useQuery } from "@tanstack/react-query";
import { getWorkspaceById } from "@/apis/workspace.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetWorkspaceById = (workspaceId: string) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceById(workspaceId),
    enabled: !!workspaceId && isAuthenticated && isAuthInitialized,
  });
};
