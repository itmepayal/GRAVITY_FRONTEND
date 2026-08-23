import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "@/apis/notification.api";
import { toast } from "sonner";

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      toast.success("Notification deleted.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete notification.");
    },
  });
};
