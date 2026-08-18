import { getMyPendingInvitations } from "@/apis/invitation.api";
import { useQuery } from "@tanstack/react-query";

export const useGetMyPendingInvitations = () => {
  return useQuery({
    queryKey: ["my-pending-invitations"],
    queryFn: getMyPendingInvitations,
  });
};
