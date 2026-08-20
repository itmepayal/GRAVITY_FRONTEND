import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNotificationPreferences } from "@/apis/user.api";
import { toast } from "sonner";

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      emailNotifications?: boolean;
      taskAssigned?: boolean;
      mentionAlerts?: boolean;
      weeklyDigest?: boolean;
    }) => updateNotificationPreferences(data),
    onSuccess: () => {
      toast.success("Notification preferences updated");
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update notification preferences",
      );
    },
  });
};
