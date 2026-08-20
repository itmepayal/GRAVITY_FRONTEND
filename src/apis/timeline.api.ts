import { api } from "@/lib/api";

export type MilestoneStatus =
  | "upcoming"
  | "in_progress"
  | "completed"
  | "missed";

export interface IMilestone {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  workspace: string | any;
  project: string | any;
  sprint?: string | any;
  status: MilestoneStatus;
  startDate: string;
  dueDate: string;
  completedAt?: string;
  linkedTasks?: any[];
  progress: number;
  color?: string;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  workspace: string;
  project: string;
  sprint?: string;
  status?: MilestoneStatus;
  startDate: string;
  dueDate: string;
  color?: string;
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string;
  status?: MilestoneStatus;
  progress?: number;
  color?: string;
}

export const getProjectMilestones = async (projectId: string) => {
  const response = await api.get(`/milestones/project/${projectId}`);
  return response.data;
};

export const createMilestone = async (data: CreateMilestoneInput) => {
  const response = await api.post("/milestones", data);
  return response.data;
};

export const updateMilestone = async (
  milestoneId: string,
  data: UpdateMilestoneInput,
) => {
  const response = await api.patch(`/milestones/${milestoneId}`, data);
  return response.data;
};

export const deleteMilestone = async (milestoneId: string) => {
  const response = await api.delete(`/milestones/${milestoneId}`);
  return response.data;
};
