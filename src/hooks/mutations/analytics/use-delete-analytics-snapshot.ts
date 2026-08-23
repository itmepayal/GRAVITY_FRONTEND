import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAnalyticsSnapshot } from "@/apis/analytics.api";

export const useDeleteAnalyticsSnapshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (analyticsId: string) => deleteAnalyticsSnapshot(analyticsId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-snapshots"] });
    },
  });
};
