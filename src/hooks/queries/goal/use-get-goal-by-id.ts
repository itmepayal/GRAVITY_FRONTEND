import { useQuery } from "@tanstack/react-query";
import { getGoalById } from "@/apis/goal.api";

export const useGetGoalById = (goalId: string) => {
  return useQuery({
    queryKey: ["goal", goalId],
    queryFn: () => getGoalById(goalId),
    enabled: !!goalId,
  });
};
