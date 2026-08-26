import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type {
  LoginFormData,
  RegisterFormData,
  RegisterResponse,
  EmailFormData,
  LoginResponse,
  VerifyEmailFormData,
  VerifyEmailResponse,
  ResetPasswordFormData,
  VerifyTwoFAFormData,
  MessageResponse,
  RefreshTokenResponse,
  TwoFAResponse,
  SessionsResponse,
  LinkGoogleResponse,
  RevokeSessionResponse,
  RevokeOtherSessionsResponse,
} from "@/types/auth";

/**
 * Auth API — maps 1:1 to server routes in `server/src/modules/auth/auth.router.ts`
 *
 * | Client function           | Method | Server route                    |
 * |---------------------------|--------|---------------------------------|
 * | register                  | POST   | /auth/register                  |
 * | login                     | POST   | /auth/login                     |
 * | googleLogin               | POST   | /auth/login/google              |
 * | verifyEmail               | POST   | /auth/verify-email              |
 * | resendVerificationEmail   | POST   | /auth/resend-verification-email |
 * | forgotPassword            | POST   | /auth/forgot-password           |
 * | resetPassword             | POST   | /auth/reset-password            |
 * | verifyTwoFA               | POST   | /auth/2fa/verify                |
 * | refreshToken              | POST   | /auth/refresh-token             |
 * | logout                    | POST   | /auth/logout                    |
 * | linkGoogleAccount         | POST   | /auth/link/google               |
 * | getSessions               | GET    | /auth/sessions                  |
 * | revokeSession             | DELETE | /auth/sessions/:sessionId       |
 * | revokeOtherSessions       | DELETE | /auth/sessions/others           |
 * | enableTwoFA               | PATCH  | /auth/2fa/enable                |
 * | disableTwoFA              | PATCH  | /auth/2fa/disable               |
 */

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

export const googleLogin = async (idToken: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login/google", {
    idToken,
  });

  return response.data;
};

export const verifyEmail = async (
  data: VerifyEmailFormData,
): Promise<VerifyEmailResponse> => {
  const response = await api.post<VerifyEmailResponse>(
    "/auth/verify-email",
    data,
  );

  return response.data;
};

export const resendVerificationEmail = async (
  data: EmailFormData,
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>(
    "/auth/resend-verification-email",
    {
      email: data.email,
    },
  );

  return response.data;
};

export const forgotPassword = async (
  data: EmailFormData,
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>("/auth/forgot-password", {
    email: data.email,
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

export const refreshToken = async (
  token: string,
): Promise<RefreshTokenResponse> => {
  const response = await api.post<RefreshTokenResponse>("/auth/refresh-token", {
    refreshToken: token,
  });

  return response.data;
};

export const logout = async (): Promise<MessageResponse> => {
  const refreshToken = useAuthStore.getState().refreshToken;
  const response = await api.post<MessageResponse>("/auth/logout", {
    refreshToken,
  });
  return response.data;
};

export const enableTwoFA = async (
  password?: string,
): Promise<TwoFAResponse> => {
  const response = await api.patch<TwoFAResponse>("/auth/2fa/enable", {
    password,
  });
  return response.data;
};

export const disableTwoFA = async (
  password?: string,
): Promise<TwoFAResponse> => {
  const response = await api.patch<TwoFAResponse>("/auth/2fa/disable", {
    password,
  });
  return response.data;
};

export const linkGoogleAccount = async (
  idToken: string,
): Promise<LinkGoogleResponse> => {
  const response = await api.post<LinkGoogleResponse>("/auth/link/google", {
    idToken,
  });
  return response.data;
};

export const getSessions = async (
  refreshToken?: string,
): Promise<SessionsResponse> => {
  const response = await api.get<SessionsResponse>("/auth/sessions", {
    params: refreshToken ? { refreshToken } : undefined,
  });
  return response.data;
};

export const revokeSession = async (
  sessionId: number,
  refreshToken?: string,
): Promise<RevokeSessionResponse> => {
  const response = await api.delete<RevokeSessionResponse>(
    `/auth/sessions/${sessionId}`,
    {
      data: refreshToken ? { refreshToken } : undefined,
    },
  );
  return response.data;
};

export const revokeOtherSessions = async (
  refreshToken: string,
): Promise<RevokeOtherSessionsResponse> => {
  const response = await api.delete<RevokeOtherSessionsResponse>(
    "/auth/sessions/others",
    {
      data: { refreshToken },
    },
  );
  return response.data;
};
