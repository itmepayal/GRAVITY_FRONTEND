import { useQuery } from "@tanstack/react-query";
import { getWorkspaceCalendarEvents } from "@/apis/calendar.api";
import type { GetCalendarEventsFilters } from "@/apis/calendar.api";

export const useGetWorkspaceCalendarEvents = (
  workspaceId: string,
  filters?: GetCalendarEventsFilters,
) => {
  return useQuery({
    queryKey: ["calendar-events", workspaceId, filters],
    queryFn: () => getWorkspaceCalendarEvents(workspaceId, filters),
    enabled: !!workspaceId,
  });
};
