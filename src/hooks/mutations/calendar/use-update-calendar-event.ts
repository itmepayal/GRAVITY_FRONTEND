import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCalendarEvent } from "@/apis/calendar.api";
import type { CreateCalendarEventInput } from "@/apis/calendar.api";
import { toast } from "sonner";

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: Partial<CreateCalendarEventInput>;
    }) => updateCalendarEvent(eventId, data),
    onSuccess: () => {
      toast.success("Calendar event updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["calendar-events"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update calendar event",
      );
    },
  });
};
