import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsAsRead } from "@/apis/notification.api";
import { toast } from "sonner";

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId?: string) => markAllNotificationsAsRead(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      toast.success("All notifications marked as read.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to mark notifications as read.");
    },
  });
};
