import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upgradeBillingPlan } from "@/apis/billing.api";
import type { UpgradeBillingPlanPayload } from "@/types/billing";

export const useUpgradeBillingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpgradeBillingPlanPayload) => upgradeBillingPlan(payload),
    onSuccess: (res) => {
      const workspaceId = typeof res.data.workspace === "object" ? res.data.workspace._id : res.data.workspace;
      queryClient.invalidateQueries({ queryKey: ["billing", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
};
