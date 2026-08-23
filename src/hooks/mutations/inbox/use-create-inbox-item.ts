import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInboxItem } from "@/apis/inbox.api";
import type { CreateInboxItemPayload } from "@/types/inbox";
import { toast } from "sonner";

export const useCreateInboxItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInboxItemPayload) => createInboxItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-inbox"] });
      toast.success("Inbox message sent successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send inbox message.");
    },
  });
};
