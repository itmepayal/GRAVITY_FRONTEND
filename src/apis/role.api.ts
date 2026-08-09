import { api } from "@/lib/api";

export const getWorkspaceRoles = async (workspaceId: string) => {
  const response = await api.get(`/roles/${workspaceId}`);
  return response.data;
};

export const updateWorkspaceRole = async (
  workspaceId: string,
  roleId: string,
  data: {
    name?: string;
    permissions?: string[];
  },
) => {
  const response = await api.patch(`/roles/${workspaceId}/${roleId}`, data);
  return response.data;
};

export const deleteWorkspaceRole = async (
  workspaceId: string,
  roleId: string,
) => {
  const response = await api.delete(`/roles/${workspaceId}/${roleId}`);
  return response.data;
};
