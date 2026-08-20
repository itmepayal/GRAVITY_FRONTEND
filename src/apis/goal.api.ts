import { api } from "@/lib/api";

import type {
  CreateGoalData,
  UpdateGoalData,
  GoalResponse,
  MessageResponse,
} from "@/types/goal";

export const createGoal = async (
  workspaceId: string,
  data: CreateGoalData,
): Promise<GoalResponse> => {
  const response = await api.post<GoalResponse>(
    `/goals/workspaces/${workspaceId}/goals`,
    data,
  );

  return response.data;
};

export const getWorkspaceGoals = async (
  workspaceId: string,
): Promise<any> => {
  const response = await api.get(
    `/goals/workspaces/${workspaceId}/goals`,
  );

  return response.data;
};

export const getGoalById = async (goalId: string): Promise<GoalResponse> => {
  const response = await api.get<GoalResponse>(`/goals/${goalId}`);

  return response.data;
};

export const updateGoal = async (
  goalId: string,
  data: UpdateGoalData,
): Promise<GoalResponse> => {
  const response = await api.patch<GoalResponse>(`/goals/${goalId}`, data);

  return response.data;
};

export const deleteGoal = async (goalId: string): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(`/goals/${goalId}`);

  return response.data;
};

export const linkTaskToGoal = async (
  goalId: string,
  taskId: string,
): Promise<GoalResponse> => {
  const response = await api.post<GoalResponse>(
    `/goals/${goalId}/tasks/${taskId}`,
  );

  return response.data;
};

export const unlinkTaskFromGoal = async (
  goalId: string,
  taskId: string,
): Promise<GoalResponse> => {
  const response = await api.delete<GoalResponse>(
    `/goals/${goalId}/tasks/${taskId}`,
  );

  return response.data;
};
