import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationAsRead } from "@/apis/notification.api";

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    },
  });
};
