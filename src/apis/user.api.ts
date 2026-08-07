import { api } from "@/lib/api";
import type {
  ChangeProfileFormData,
  ChangeProfileResponse,
} from "@/types/settings";
import type { MessageResponse } from "@/types/auth";
import type { User } from "@/types/user";

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{
    success: boolean;
    statusCode: number;
    message: string;
    data: User;
  }>("/users/me");

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

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<{
    success: boolean;
    statusCode: number;
    message: string;
    data: User[];
  }>("/users");
  console.log(response);
  return response.data.data;
};
