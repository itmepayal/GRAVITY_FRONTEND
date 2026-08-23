import { api } from "@/lib/api";
import type {
  GetAnalyticsQueryParams,
  IAnalyticsOverview,
  IAnalyticsSnapshot,
  CreateAnalyticsSnapshotPayload,
  AnalyticsPeriod,
} from "@/types/analytics";

export interface AnalyticsOverviewResponse {
  success: boolean;
  message: string;
  data: IAnalyticsOverview;
}

export interface AnalyticsSnapshotsListResponse {
  success: boolean;
  message: string;
  data: IAnalyticsSnapshot[];
}

export interface AnalyticsSnapshotSingleResponse {
  success: boolean;
  message: string;
  data: IAnalyticsSnapshot;
}

export const getAnalyticsOverview = async (
  params: GetAnalyticsQueryParams
): Promise<AnalyticsOverviewResponse> => {
  const { workspaceId, ...queryParams } = params;
  const response = await api.get<AnalyticsOverviewResponse>(
    `/analytics/workspace/${workspaceId}`,
    { params: queryParams }
  );
  return response.data;
};

export const listAnalyticsSnapshots = async (params: {
  workspaceId: string;
  projectId?: string;
  period?: AnalyticsPeriod;
  limit?: number;
}): Promise<AnalyticsSnapshotsListResponse> => {
  const response = await api.get<AnalyticsSnapshotsListResponse>(
    "/analytics/snapshots",
    { params }
  );
  return response.data;
};

export const createAnalyticsSnapshot = async (
  payload: CreateAnalyticsSnapshotPayload
): Promise<AnalyticsSnapshotSingleResponse> => {
  const response = await api.post<AnalyticsSnapshotSingleResponse>(
    "/analytics/snapshots",
    payload
  );
  return response.data;
};

export const getAnalyticsById = async (
  analyticsId: string
): Promise<AnalyticsSnapshotSingleResponse> => {
  const response = await api.get<AnalyticsSnapshotSingleResponse>(
    `/analytics/snapshots/${analyticsId}`
  );
  return response.data;
};

export const deleteAnalyticsSnapshot = async (
  analyticsId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/analytics/snapshots/${analyticsId}`
  );
  return response.data;
};
