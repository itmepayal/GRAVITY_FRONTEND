import { useQuery } from "@tanstack/react-query";
import { getWorkspaceInvitations } from "@/apis/invitation.api";

export const useGetWorkspaceInvitations = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-invitations", workspaceId],
    queryFn: () => getWorkspaceInvitations(workspaceId),
    enabled: !!workspaceId,
  });
};
