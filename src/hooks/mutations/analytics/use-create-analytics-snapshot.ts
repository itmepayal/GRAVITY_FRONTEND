import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAnalyticsSnapshot } from "@/apis/analytics.api";
import type { CreateAnalyticsSnapshotPayload } from "@/types/analytics";

export const useCreateAnalyticsSnapshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAnalyticsSnapshotPayload) =>
      createAnalyticsSnapshot(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-snapshots"] });
    },
  });
};
