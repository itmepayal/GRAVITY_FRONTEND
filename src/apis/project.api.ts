import { api } from "@/lib/api";

export const addProjectMember = async (
  projectId: string,
  data: {
    userId: string;
    roleId: string;
  },
) => {
  console.log(data.roleId);
  const response = await api.post(`/projects/${projectId}/members`, data);
  return response.data;
};

export const updateProjectMemberRole = async (
  projectId: string,
  userId: string,
  data: {
    roleId: string;
  },
) => {
  const response = await api.patch(
    `/projects/${projectId}/members/${userId}`,
    data,
  );
  return response.data;
};

export const removeProjectMember = async (
  projectId: string,
  userId: string,
) => {
  const response = await api.delete(`/projects/${projectId}/members/${userId}`);
  return response.data;
};

export const createBoard = async (
  projectId: string,
  data: {
    name: string;
    description?: string;
    type?: string;
  },
) => {
  const response = await api.post(`/projects/${projectId}/boards`, data);
  return response.data;
};

export const listBoards = async (projectId: string) => {
  const response = await api.get(`/projects/${projectId}/boards`);
  return response.data;
};

export const createSprint = async (
  projectId: string,
  data: {
    name: string;
    goal?: string;
    startDate: string;
    endDate: string;
  },
) => {
  const response = await api.post(`/projects/${projectId}/sprints`, data);
  return response.data;
};

export const getProjectSprints = async (projectId: string) => {
  const response = await api.get(`/projects/${projectId}/sprints`);
  return response.data;
};

export const getProjectTasks = async (projectId: string) => {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data;
};
