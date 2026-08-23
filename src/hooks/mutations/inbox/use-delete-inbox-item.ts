import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInboxItem } from "@/apis/inbox.api";
import { toast } from "sonner";

export const useDeleteInboxItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inboxId: string) => deleteInboxItem(inboxId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-inbox"] });
      toast.success("Inbox item deleted.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete inbox item.");
    },
  });
};
