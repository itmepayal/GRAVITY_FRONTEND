import type { User } from "./user";

export type RegisterResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: User;
};

export type LoginResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    requiresTwoFA?: boolean;
    email?: string;
  };
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
