import { api } from "@/lib/api";
import type {
  INotification,
  ListNotificationsQueryParams,
  CreateNotificationPayload,
} from "@/types/notification";

export interface NotificationsListResponse {
  success: boolean;
  message: string;
  data: {
    notifications: INotification[];
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

export interface NotificationSingleResponse {
  success: boolean;
  message: string;
  data: INotification;
}

export const createNotification = async (
  payload: CreateNotificationPayload,
): Promise<NotificationSingleResponse> => {
  const response = await api.post<NotificationSingleResponse>("/notifications", payload);
  return response.data;
};

export const listNotifications = async (
  params: ListNotificationsQueryParams,
): Promise<NotificationsListResponse> => {
  const response = await api.get<NotificationsListResponse>("/notifications", { params });
  return response.data;
};

export const markNotificationAsRead = async (
  notificationId: string,
): Promise<NotificationSingleResponse> => {
  const response = await api.patch<NotificationSingleResponse>(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async (
  workspaceId?: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.patch<{ success: boolean; message: string }>("/notifications/read-all", null, {
    params: { workspaceId },
  });
  return response.data;
};

export const deleteNotification = async (
  notificationId: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/notifications/${notificationId}`);
  return response.data;
};
