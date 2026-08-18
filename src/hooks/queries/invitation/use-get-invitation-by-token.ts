import { getInvitationByToken } from "@/apis/invitation.api";
import { useQuery } from "@tanstack/react-query";

export const useGetInvitationByToken = (token: string) => {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitationByToken(token),
    enabled: !!token,
  });
};
