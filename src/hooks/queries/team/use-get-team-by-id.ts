import { useQuery } from "@tanstack/react-query";
import { getTeamById } from "@/apis/team.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetTeamById = (teamId: string) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["team", teamId],
    queryFn: () => getTeamById(teamId),
    enabled: !!teamId && isAuthenticated && isAuthInitialized,
  });
};
