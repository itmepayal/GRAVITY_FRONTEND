import { api } from "@/lib/api";
import type {
  IIntegration,
  CreateIntegrationPayload,
  UpdateIntegrationPayload,
  ListIntegrationsQueryParams,
} from "@/types/integration";

export interface IntegrationsListResponse {
  success: boolean;
  message: string;
  data: IIntegration[];
}

export interface IntegrationSingleResponse {
  success: boolean;
  message: string;
  data: IIntegration;
}

export const listWorkspaceIntegrations = async (
  params: ListIntegrationsQueryParams
): Promise<IntegrationsListResponse> => {
  const { workspaceId, ...queryParams } = params;
  const response = await api.get<IntegrationsListResponse>(
    `/integrations/workspace/${workspaceId}`,
    { params: queryParams }
  );
  return response.data;
};

export const createIntegration = async (
  payload: CreateIntegrationPayload
): Promise<IntegrationSingleResponse> => {
  const response = await api.post<IntegrationSingleResponse>(
    "/integrations",
    payload
  );
  return response.data;
};

export const getIntegrationById = async (
  integrationId: string
): Promise<IntegrationSingleResponse> => {
  const response = await api.get<IntegrationSingleResponse>(
    `/integrations/${integrationId}`
  );
  return response.data;
};

export const updateIntegration = async (
  integrationId: string,
  payload: UpdateIntegrationPayload
): Promise<IntegrationSingleResponse> => {
  const response = await api.patch<IntegrationSingleResponse>(
    `/integrations/${integrationId}`,
    payload
  );
  return response.data;
};

export const toggleIntegrationStatus = async (
  integrationId: string
): Promise<IntegrationSingleResponse> => {
  const response = await api.patch<IntegrationSingleResponse>(
    `/integrations/${integrationId}/toggle`
  );
  return response.data;
};

export const deleteIntegration = async (
  integrationId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/integrations/${integrationId}`
  );
  return response.data;
};
