import { api } from "@/lib/api";
import type {
  LoginFormData,
  RegisterFormData,
  RegisterResponse,
  EmailFormData,
  LoginResponse,
  VerifyEmailFormData,
  ResetPasswordFormData,
  VerifyTwoFAFormData,
  MessageResponse,
} from "@/types/auth";

export const register = async (
  data: RegisterFormData,
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/auth/register", data);
  return response.data;
};

export const login = async (data: LoginFormData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
};

export const verifyEmail = async (
  data: VerifyEmailFormData,
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>("/auth/verify-email", data);
  return response.data;
};

export const resendVerificationEmail = async (
  data: EmailFormData,
): Promise<MessageResponse> => {
  const { email } = data;
  const response = await api.post<MessageResponse>(
    "/auth/resend-verification-email",
    { email },
  );
  return response.data;
};

export const forgotPassword = async (
  data: EmailFormData,
): Promise<MessageResponse> => {
  const { email } = data;
  const response = await api.post<MessageResponse>("/auth/forgot-password", {
    email,
  });
  return response.data;
};

export const resetPassword = async (
  data: ResetPasswordFormData,
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>(
    "/auth/reset-password",
    data,
  );
  return response.data;
};

export const verifyTwoFA = async (
  data: VerifyTwoFAFormData,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/2fa/verify", data);
  return response.data;
};

export const logout = async (): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>("/auth/logout");
  return response.data;
};

export const enableTwoFA = async (): Promise<MessageResponse> => {
  const response = await api.patch<MessageResponse>("/auth/2fa/enable");
  return response.data;
};

export const disableTwoFA = async (): Promise<MessageResponse> => {
  const response = await api.patch<MessageResponse>("/auth/2fa/disable");
  return response.data;
};
