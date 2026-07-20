import type { User } from "./user";

export interface ChangeProfileFormData {
  name: string;
  avatar: File | null;
}

export type ChangeProfileResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: User;
};
