import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInboxItemStatus } from "@/apis/inbox.api";
import type { InboxItemStatus } from "@/types/inbox";

export const useUpdateInboxStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inboxId, status }: { inboxId: string; status: InboxItemStatus }) =>
      updateInboxItemStatus(inboxId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-inbox"] });
    },
  });
};
