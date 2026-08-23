import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNotification } from "@/apis/notification.api";
import type { CreateNotificationPayload } from "@/types/notification";
import { toast } from "sonner";

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotificationPayload) => createNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      toast.success("Notification alert created.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create notification.");
    },
  });
};
