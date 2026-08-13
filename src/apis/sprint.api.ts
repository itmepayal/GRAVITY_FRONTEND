import { api } from "@/lib/api";
import type {
  SprintResponse,
  UpdateSprintData,
  MessageResponse,
} from "@/types/sprint";
import type { TaskResponse } from "@/types/task";

export const getSprintById = async (
  sprintId: string,
): Promise<SprintResponse> => {
  const response = await api.get<SprintResponse>(`/sprints/${sprintId}`);

  return response.data;
};

export const getSprintTasks = async (
  sprintId: string,
): Promise<TaskResponse> => {
  const response = await api.get<TaskResponse>(`/sprints/${sprintId}/tasks`);

  return response.data;
};

export const updateSprint = async (
  sprintId: string,
  data: UpdateSprintData,
): Promise<SprintResponse> => {
  const response = await api.patch<SprintResponse>(
    `/sprints/${sprintId}`,
    data,
  );

  return response.data;
};

export const deleteSprint = async (
  sprintId: string,
): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(`/sprints/${sprintId}`);

  return response.data;
};

export const startSprint = async (
  sprintId: string,
): Promise<SprintResponse> => {
  const response = await api.post<SprintResponse>(`/sprints/${sprintId}/start`);

  return response.data;
};

export const completeSprint = async (
  sprintId: string,
): Promise<SprintResponse> => {
  const response = await api.post<SprintResponse>(
    `/sprints/${sprintId}/complete`,
  );

  return response.data;
};
