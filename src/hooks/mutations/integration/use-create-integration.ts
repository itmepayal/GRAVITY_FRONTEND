import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIntegration } from "@/apis/integration.api";
import type { CreateIntegrationPayload } from "@/types/integration";

export const useCreateIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateIntegrationPayload) => createIntegration(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
};
