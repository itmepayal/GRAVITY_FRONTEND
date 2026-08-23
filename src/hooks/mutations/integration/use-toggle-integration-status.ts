import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleIntegrationStatus } from "@/apis/integration.api";

export const useToggleIntegrationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (integrationId: string) => toggleIntegrationStatus(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
};
