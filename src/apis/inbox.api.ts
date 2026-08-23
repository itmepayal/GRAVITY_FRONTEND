import { api } from "@/lib/api";
import type {
  IInboxItem,
  ListInboxQueryParams,
  CreateInboxItemPayload,
  InboxItemStatus,
} from "@/types/inbox";

export interface InboxListResponse {
  success: boolean;
  message: string;
  data: {
    items: IInboxItem[];
    unreadCount: number;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface InboxSingleResponse {
  success: boolean;
  message: string;
  data: IInboxItem;
}

export const createInboxItem = async (
  payload: CreateInboxItemPayload,
): Promise<InboxSingleResponse> => {
  const response = await api.post<InboxSingleResponse>("/inbox", payload);
  return response.data;
};

export const listInbox = async (
  params: ListInboxQueryParams,
): Promise<InboxListResponse> => {
  const response = await api.get<InboxListResponse>("/inbox", { params });
  return response.data;
};

export const toggleStarInboxItem = async (
  inboxId: string,
): Promise<InboxSingleResponse> => {
  const response = await api.patch<InboxSingleResponse>(`/inbox/${inboxId}/star`);
  return response.data;
};

export const updateInboxItemStatus = async (
  inboxId: string,
  status: InboxItemStatus,
): Promise<InboxSingleResponse> => {
  const response = await api.patch<InboxSingleResponse>(`/inbox/${inboxId}/status`, { status });
  return response.data;
};

export const markAllInboxRead = async (
  workspaceId?: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.patch<{ success: boolean; message: string }>("/inbox/read-all", null, {
    params: { workspaceId },
  });
  return response.data;
};

export const deleteInboxItem = async (
  inboxId: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/inbox/${inboxId}`);
  return response.data;
};
