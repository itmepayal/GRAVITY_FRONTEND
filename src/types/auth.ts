import type { User } from "./user";

export type RegisterResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: User;
};

export type AuthTokensData = {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  requiresTwoFA?: boolean;
  email?: string;
};

export type LoginResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: AuthTokensData;
};

export type RefreshTokenResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

export type VerifyEmailResponse = LoginResponse;

export type TwoFAResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: User;
};

export type MessageResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: null;
};

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export interface VerifyEmailFormData {
  email: string;
  otp: string;
}

export interface EmailFormData {
  email: string;
}

export interface ResetPasswordFormData {
  email: string;
  otp: string;
  password: string;
}

export interface VerifyTwoFAFormData {
  email: string;
  otp: string;
}

export type AuthSession = {
  id: number;
  userAgent: string;
  createdAt: string;
};

export type SessionsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: AuthSession[];
};

export type LinkGoogleInput = {
  idToken: string;
};

export type LinkGoogleResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: User;
};
