import { api } from "@/lib/api";
import type {
  IReport,
  ListReportsQueryParams,
  CreateReportPayload,
  UpdateReportPayload,
  ReportFormat,
} from "@/types/report";

export interface ReportsListResponse {
  success: boolean;
  message: string;
  data: IReport[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ReportSingleResponse {
  success: boolean;
  message: string;
  data: IReport;
}

export const createReport = async (
  payload: CreateReportPayload,
): Promise<ReportSingleResponse> => {
  const response = await api.post<ReportSingleResponse>("/reports", payload);
  return response.data;
};

export const listReports = async (
  params: ListReportsQueryParams,
): Promise<ReportsListResponse> => {
  const { workspaceId, ...queryParams } = params;
  const response = await api.get<ReportsListResponse>(`/reports/workspace/${workspaceId}`, {
    params: queryParams,
  });
  return response.data;
};

export const getReportById = async (
  reportId: string,
): Promise<ReportSingleResponse> => {
  const response = await api.get<ReportSingleResponse>(`/reports/${reportId}`);
  return response.data;
};

export const exportReport = async (
  reportId: string,
  format?: ReportFormat,
): Promise<{ blob: Blob; filename: string }> => {
  const response = await api.get(`/reports/${reportId}/export`, {
    params: { format },
    responseType: "blob",
  });

  const contentDisposition = response.headers["content-disposition"];
  let filename = `report_${reportId}.${format || "json"}`;
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
  }

  return {
    blob: new Blob([response.data], { type: (response.headers["content-type"] as string) || "application/octet-stream" }),
    filename,
  };
};

export const updateReport = async (
  reportId: string,
  payload: UpdateReportPayload,
): Promise<ReportSingleResponse> => {
  const response = await api.patch<ReportSingleResponse>(`/reports/${reportId}`, payload);
  return response.data;
};

export const deleteReport = async (
  reportId: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/reports/${reportId}`);
  return response.data;
};
