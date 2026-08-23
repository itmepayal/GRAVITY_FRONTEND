import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSubscriptionStatus } from "@/apis/billing.api";
import type { UpdateSubscriptionStatusPayload } from "@/types/billing";

export const useUpdateSubscriptionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      payload,
    }: {
      workspaceId: string;
      payload: UpdateSubscriptionStatusPayload;
    }) => updateSubscriptionStatus(workspaceId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["billing", variables.workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
};
