import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllInboxRead } from "@/apis/inbox.api";
import { toast } from "sonner";

export const useMarkAllInboxRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId?: string) => markAllInboxRead(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-inbox"] });
      toast.success("All inbox messages marked as read.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to mark all as read.");
    },
  });
};
