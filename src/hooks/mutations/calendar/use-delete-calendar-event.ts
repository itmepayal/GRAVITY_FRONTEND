import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCalendarEvent } from "@/apis/calendar.api";
import { toast } from "sonner";

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteCalendarEvent(eventId),
    onSuccess: () => {
      toast.success("Calendar event deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["calendar-events"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete calendar event",
      );
    },
  });
};
