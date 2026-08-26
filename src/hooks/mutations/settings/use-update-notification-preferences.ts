import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNotificationPreferences } from "@/apis/settings.api";
import { toast } from "sonner";
import type { NotificationPreferences, User } from "@/types/user";

type NotificationPreferencesResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: User;
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      updateNotificationPreferences(data),
    onSuccess: (response: NotificationPreferencesResponse) => {
      toast.success("Notification preferences updated");
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
      return response;
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update notification preferences",
      );
    },
  });
};
