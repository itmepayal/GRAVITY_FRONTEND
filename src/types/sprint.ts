export type SprintStatus = "planned" | "active" | "completed";

export interface Sprint {
  id: string;
  name: string;
  workspace: string;
  project: string;
  board?: string | null;
  goal?: string | null;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSprintData {
  name?: string;
  board?: string | null;
  goal?: string | null;
  startDate?: string;
  endDate?: string;
  status?: SprintStatus;
}

export interface SprintResponse {
  success: boolean;
  message: string;
  data: Sprint;
}

export interface SprintListResponse {
  success: boolean;
  message: string;
  data: Sprint[];
}

export interface MessageResponse {
  success: boolean;
  message: string;
}
