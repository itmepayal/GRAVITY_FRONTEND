export type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  authProvider?: "local" | "google";
  isEmailVerified: boolean;
  lastLogin: string | null;
  is2FAEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = Pick<User, "id" | "name" | "email" | "avatar">;

export type GetUsersParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export type PaginatedUsersResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: User[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

export type AccountActionInput = {
  password?: string;
  idToken?: string;
};

export type ReactivateAccountInput = {
  email: string;
  password: string;
};

export type UserProfileResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: UserProfile;
};
