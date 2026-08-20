import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCalendarEvent } from "@/apis/calendar.api";
import type { CreateCalendarEventInput } from "@/apis/calendar.api";
import { toast } from "sonner";

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCalendarEventInput) => createCalendarEvent(data),
    onSuccess: () => {
      toast.success("Calendar event created successfully");
      queryClient.invalidateQueries({
        queryKey: ["calendar-events"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create calendar event",
      );
    },
  });
};
