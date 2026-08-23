import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIntegration } from "@/apis/integration.api";

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (integrationId: string) => deleteIntegration(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
};
