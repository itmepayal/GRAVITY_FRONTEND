import { api } from "@/lib/api";

export const createWorkspace = async (data: {
  name: string;
  description?: string;
}) => {
  const response = await api.post("/workspaces", data);
  return response.data;
};

export const getUserWorkspaces = async () => {
  const response = await api.get("/workspaces");
  return response.data;
};

export const getWorkspaceById = async (workspaceId: string) => {
  const response = await api.get(`/workspaces/${workspaceId}`);
  return response.data;
};

export const updateWorkspace = async ({
  workspaceId,
  data,
}: {
  workspaceId: string;
  data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    isPrivate?: boolean;
  };
}) => {
  const response = await api.patch(`/workspaces/${workspaceId}`, data);
  return response.data;
};

export const deleteWorkspace = async (workspaceId: string) => {
  const response = await api.delete(`/workspaces/${workspaceId}`);
  return response.data;
};

export const addWorkspaceMember = async ({
  workspaceId,
  data,
}: {
  workspaceId: string;
  data: {
    email: string;
    roleId: string;
  };
}) => {
  const response = await api.post(`/workspaces/${workspaceId}/members`, data);
  return response.data;
};

export const updateWorkspaceMemberRole = async (
  workspaceId: string,
  userId: string,
  data: {
    roleId: string;
  },
) => {
  const response = await api.patch(
    `/workspaces/${workspaceId}/members/${userId}`,
    data,
  );
  return response.data;
};

export const removeWorkspaceMember = async ({
  workspaceId,
  userId,
}: {
  workspaceId: string;
  userId: string;
}) => {
  const response = await api.delete(
    `/workspaces/${workspaceId}/members/${userId}`,
  );
  return response.data;
};

export const createProject = async (
  workspaceId: string,
  data: {
    name: string;
    description?: string;
    status?: string;
    color?: string;
    startDate?: string;
    dueDate?: string;
  },
) => {
  const response = await api.post(`/workspaces/${workspaceId}/projects`, data);
  return response.data;
};

export const getWorkspaceProjects = async (workspaceId: string) => {
  const response = await api.get(`/workspaces/${workspaceId}/projects`);
  return response.data;
};

export const getProjectById = async (
  workspaceId: string,
  projectId: string,
) => {
  const response = await api.get(
    `/workspaces/${workspaceId}/projects/${projectId}`,
  );
  return response.data;
};

export const updateProject = async (
  workspaceId: string,
  projectId: string,
  data: {
    name?: string;
    description?: string;
  },
) => {
  const response = await api.patch(
    `/workspaces/${workspaceId}/projects/${projectId}`,
    data,
  );
  return response.data;
};

export const deleteProject = async (workspaceId: string, projectId: string) => {
  const response = await api.delete(
    `/workspaces/${workspaceId}/projects/${projectId}`,
  );
  return response.data;
};

export const getWorkspaceRoles = async (workspaceId: string) => {
  const response = await api.get(`/workspaces/${workspaceId}/roles`);
  return response.data;
};

export const createWorkspaceRole = async (
  workspaceId: string,
  data: {
    name: string;
    permissions: string[];
  },
) => {
  const response = await api.post(`/workspaces/${workspaceId}/roles`, data);
  return response.data;
};

export const regenerateInviteCode = async (workspaceId: string) => {
  const response = await api.post(
    `/invitations/workspaces/${workspaceId}/link`,
    {},
  );
  return response.data;
};
