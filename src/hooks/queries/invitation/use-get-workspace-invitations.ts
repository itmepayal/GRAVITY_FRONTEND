import { useQuery } from "@tanstack/react-query";
import { getWorkspaceInvitations } from "@/apis/invitation.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetWorkspaceInvitations = (workspaceId: string) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["workspace-invitations", workspaceId],
    queryFn: () => getWorkspaceInvitations(workspaceId),
    enabled: !!workspaceId && isAuthenticated && isAuthInitialized,
  });
};
