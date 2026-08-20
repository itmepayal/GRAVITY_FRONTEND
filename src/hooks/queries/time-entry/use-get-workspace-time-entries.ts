import { useQuery } from "@tanstack/react-query";
import { getWorkspaceTimeEntries } from "@/apis/time-entry.api";
import type { GetTimeEntriesFilters } from "@/apis/time-entry.api";

export const useGetWorkspaceTimeEntries = (
  workspaceId: string,
  filters?: GetTimeEntriesFilters,
) => {
  return useQuery({
    queryKey: ["time-entries", workspaceId, filters],
    queryFn: () => getWorkspaceTimeEntries(workspaceId, filters),
    enabled: !!workspaceId,
  });
};
