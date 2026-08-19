import { api } from "@/lib/api";

/**
 * Get all permissions available in the system
 */
export const getAllPermissions = async () => {
  const response = await api.get("/roles/permissions/all");
  return response.data;
};

/**
 * Get all roles available in a workspace
 * Includes system roles + custom workspace roles
 */
export const getWorkspaceRoles = async (workspaceId: string) => {
  const response = await api.get(`/roles/${workspaceId}`);
  return response.data;
};

/**
 * Create a custom workspace role
 */
export const createWorkspaceRole = async (
  workspaceId: string,
  data: {
    name: string;
    permissions: string[];
  },
) => {
  const response = await api.post(`/roles/${workspaceId}`, data);
  return response.data;
};

/**
 * Update a custom workspace role
 */
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

/**
 * Delete a custom workspace role
 */
export const deleteWorkspaceRole = async (
  workspaceId: string,
  roleId: string,
) => {
  const response = await api.delete(`/roles/${workspaceId}/${roleId}`);
  return response.data;
};

