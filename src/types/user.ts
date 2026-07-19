export type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  isEmailVerified: boolean;
  lastLogin: string | null;
  is2FAEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};
