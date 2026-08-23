import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIntegration } from "@/apis/integration.api";
import type { UpdateIntegrationPayload } from "@/types/integration";

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      integrationId,
      payload,
    }: {
      integrationId: string;
      payload: UpdateIntegrationPayload;
    }) => updateIntegration(integrationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
};
