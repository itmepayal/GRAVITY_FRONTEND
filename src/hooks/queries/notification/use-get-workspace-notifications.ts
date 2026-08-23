import { useQuery } from "@tanstack/react-query";
import { listNotifications } from "@/apis/notification.api";
import type { ListNotificationsQueryParams } from "@/types/notification";

export const useGetWorkspaceNotifications = (params: ListNotificationsQueryParams) => {
  return useQuery({
    queryKey: ["user-notifications", params],
    queryFn: () => listNotifications(params),
  });
};
