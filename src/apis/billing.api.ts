import { api } from "@/lib/api";
import type {
  IBilling,
  UpgradeBillingPlanPayload,
  UpdateSubscriptionStatusPayload,
} from "@/types/billing";

export interface BillingResponse {
  success: boolean;
  message: string;
  data: IBilling;
}

export const getWorkspaceBilling = async (
  workspaceId: string
): Promise<BillingResponse> => {
  const response = await api.get<BillingResponse>(
    `/billing/workspace/${workspaceId}`
  );
  return response.data;
};

export const upgradeBillingPlan = async (
  payload: UpgradeBillingPlanPayload
): Promise<BillingResponse> => {
  const response = await api.post<BillingResponse>("/billing/upgrade", payload);
  return response.data;
};

export const updateSubscriptionStatus = async (
  workspaceId: string,
  payload: UpdateSubscriptionStatusPayload
): Promise<BillingResponse> => {
  const response = await api.patch<BillingResponse>(
    `/billing/workspace/${workspaceId}/status`,
    payload
  );
  return response.data;
};
