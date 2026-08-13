import { api } from "@/lib/api";
import type {
  CreateTaskData,
  UpdateTaskData,
  TaskResponse,
  TasksResponse,
  MessageResponse,
  SubTaskData,
  CommentData,
} from "@/types/task";

export const createTask = async (
  data: CreateTaskData | FormData,
): Promise<TaskResponse> => {
  const response = await api.post<TaskResponse>("/tasks", data, {
    headers:
      data instanceof FormData
        ? { "Content-Type": undefined }
        : { "Content-Type": "application/json" },
  });
  return response.data;
};

export const getBoardTasks = async (
  boardId: string,
): Promise<TasksResponse> => {
  const response = await api.get<TasksResponse>(
    `/tasks/boards/${boardId}/tasks`,
  );

  return response.data;
};

export const getTaskById = async (taskId: string): Promise<TaskResponse> => {
  const response = await api.get<TaskResponse>(`/tasks/${taskId}`);

  return response.data;
};

export const updateTask = async (
  taskId: string,
  data: UpdateTaskData | FormData,
): Promise<TaskResponse> => {
  const response = await api.patch<TaskResponse>(`/tasks/${taskId}`, data, {
    headers:
      data instanceof FormData
        ? { "Content-Type": undefined }
        : { "Content-Type": "application/json" },
  });

  return response.data;
};

export const deleteTask = async (taskId: string): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(`/tasks/${taskId}`);

  return response.data;
};

export const archiveTask = async (taskId: string): Promise<TaskResponse> => {
  const response = await api.patch<TaskResponse>(`/tasks/${taskId}/archive`);

  return response.data;
};

export const moveTask = async (
  taskId: string,
  data: {
    boardId?: string;
    column?: string;
    status?: string;
  },
): Promise<TaskResponse> => {
  const response = await api.patch<TaskResponse>(`/tasks/${taskId}/move`, data);

  return response.data;
};

export const assignTask = async (
  taskId: string,
  assigneeId: string,
): Promise<TaskResponse> => {
  const response = await api.patch<TaskResponse>(`/tasks/${taskId}/assignee`, {
    assigneeId,
  });

  return response.data;
};

export const addSubTask = async (
  taskId: string,
  data: SubTaskData,
): Promise<TaskResponse> => {
  const response = await api.post<TaskResponse>(
    `/tasks/${taskId}/subtasks`,
    data,
  );

  return response.data;
};

export const updateSubTask = async (
  taskId: string,
  subtaskId: string,
  data: Partial<SubTaskData>,
): Promise<TaskResponse> => {
  const response = await api.patch<TaskResponse>(
    `/tasks/${taskId}/subtasks/${subtaskId}`,
    data,
  );

  return response.data;
};

export const deleteSubTask = async (
  taskId: string,
  subtaskId: string,
): Promise<TaskResponse> => {
  const response = await api.delete<TaskResponse>(
    `/tasks/${taskId}/subtasks/${subtaskId}`,
  );

  return response.data;
};

export const addComment = async (
  taskId: string,
  data: CommentData,
): Promise<TaskResponse> => {
  const response = await api.post<TaskResponse>(
    `/tasks/${taskId}/comments`,
    data,
  );

  return response.data;
};

export const updateComment = async (
  taskId: string,
  commentId: string,
  data: CommentData,
): Promise<TaskResponse> => {
  const response = await api.patch<TaskResponse>(
    `/tasks/${taskId}/comments/${commentId}`,
    data,
  );

  return response.data;
};

export const deleteComment = async (
  taskId: string,
  commentId: string,
): Promise<TaskResponse> => {
  const response = await api.delete<TaskResponse>(
    `/tasks/${taskId}/comments/${commentId}`,
  );

  return response.data;
};

export const addWatcher = async (
  taskId: string,
  userId: string,
): Promise<TaskResponse> => {
  const response = await api.post<TaskResponse>(`/tasks/${taskId}/watchers`, {
    userId,
  });

  return response.data;
};

export const removeWatcher = async (
  taskId: string,
  userId: string,
): Promise<TaskResponse> => {
  const response = await api.delete<TaskResponse>(
    `/tasks/${taskId}/watchers/${userId}`,
  );

  return response.data;
};

export const updateActualHours = async (
  taskId: string,
  actualHours: number,
): Promise<TaskResponse> => {
  const response = await api.patch<TaskResponse>(`/tasks/${taskId}/hours`, {
    actualHours,
  });

  return response.data;
};
