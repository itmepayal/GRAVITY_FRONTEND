import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleStarInboxItem } from "@/apis/inbox.api";

export const useToggleStarInboxItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inboxId: string) => toggleStarInboxItem(inboxId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-inbox"] });
    },
  });
};
