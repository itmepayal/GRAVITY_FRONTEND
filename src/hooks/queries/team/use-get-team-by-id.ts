import { getTeamById } from "@/apis/team.api";
import { useQuery } from "@tanstack/react-query";

export const useGetTeamById = (teamId: string) => {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: () => getTeamById(teamId),
    enabled: !!teamId,
  });
};
