import { api } from "@/lib/api";

export interface ITimeEntry {
  id?: string;
  _id?: string;
  workspace: string | any;
  project?: string | any;
  task?: string | any;
  user: string | any;
  description?: string;
  durationMinutes: number;
  startTime?: string;
  endTime?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTimeEntryInput {
  workspace: string;
  project?: string;
  task?: string;
  description?: string;
  durationMinutes: number;
  startTime?: string;
  endTime?: string;
  date?: string;
}

export interface GetTimeEntriesFilters {
  projectId?: string;
  taskId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export const getWorkspaceTimeEntries = async (
  workspaceId: string,
  filters?: GetTimeEntriesFilters,
) => {
  const params = new URLSearchParams();
  if (filters?.projectId) params.append("projectId", filters.projectId);
  if (filters?.taskId) params.append("taskId", filters.taskId);
  if (filters?.userId) params.append("userId", filters.userId);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/time-entries/workspace/${workspaceId}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await api.get(url);
  return response.data;
};

export const createTimeEntry = async (data: CreateTimeEntryInput) => {
  const response = await api.post("/time-entries", data);
  return response.data;
};

export const deleteTimeEntry = async (id: string) => {
  const response = await api.delete(`/time-entries/${id}`);
  return response.data;
};
