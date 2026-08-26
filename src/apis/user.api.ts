import { api } from "@/lib/api";
import type {
  ChangeProfileFormData,
  ChangeProfileResponse,
} from "@/types/settings";
import type { MessageResponse } from "@/types/auth";
import type {
  AccountActionInput,
  GetUsersParams,
  PaginatedUsersResponse,
  ReactivateAccountInput,
  User,
  UserProfileResponse,
} from "@/types/user";

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{
    success: boolean;
    statusCode: number;
    message: string;
    data: User;
  }>("/users/me");

  return response.data.data;
};

export const getUserById = async (userId: string) => {
  const response = await api.get<UserProfileResponse>(`/users/${userId}`);
  return response.data.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>(
    "/users/change-password",
    data,
  );

  return response.data;
};

export const changeProfile = async (
  data: ChangeProfileFormData,
): Promise<ChangeProfileResponse> => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }
  const response = await api.patch<ChangeProfileResponse>(
    "/users/profile",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const updateNotificationPreferences = async (data: {
  emailNotifications?: boolean;
  taskAssigned?: boolean;
  mentionAlerts?: boolean;
  weeklyDigest?: boolean;
}): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data: User;
}> => {
  const response = await api.patch("/users/notifications/preferences", data);
  return response.data;
};

export const getUsers = async (
  params?: GetUsersParams,
): Promise<PaginatedUsersResponse> => {
  const response = await api.get<PaginatedUsersResponse>("/users", {
    params: { limit: 100, ...params },
  });
  return response.data;
};

export const getAllUsers = async (params?: GetUsersParams): Promise<User[]> => {
  const response = await getUsers(params);
  return response.data;
};

export const deactivateAccount = async (
  data: AccountActionInput,
): Promise<MessageResponse> => {
  const response = await api.patch<MessageResponse>(
    "/users/account/deactivate",
    data,
  );
  return response.data;
};

export const deleteAccount = async (
  data: AccountActionInput,
): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>("/users/account", {
    data,
  });
  return response.data;
};

export const reactivateAccount = async (
  data: ReactivateAccountInput,
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>(
    "/users/account/reactivate",
    data,
  );
  return response.data;
};
