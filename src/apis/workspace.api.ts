import { api } from "@/lib/api";
import type {
  CreateWorkspaceInput,
  CreateWorkspaceProjectInput,
  RemoveWorkspaceMemberInput,
  UpdateWorkspaceInput,
  UpdateWorkspaceMemberRoleInput,
  UpdateWorkspaceProjectInput,
  WorkspaceMessageResponse,
  WorkspaceProjectResponse,
  WorkspaceProjectsListResponse,
  WorkspaceResponse,
  WorkspacesListResponse,
} from "@/types/workspace";

/**
 * Workspace API — maps 1:1 to server routes in `server/src/modules/workspace/workspace.route.ts`
 *
 * | Client function            | Method | Server route                                      |
 * |----------------------------|--------|---------------------------------------------------|
 * | createWorkspace            | POST   | /workspaces                                       |
 * | getUserWorkspaces          | GET    | /workspaces                                       |
 * | getWorkspaceById           | GET    | /workspaces/:workspaceId                          |
 * | updateWorkspace            | PATCH  | /workspaces/:workspaceId                          |
 * | deleteWorkspace            | DELETE | /workspaces/:workspaceId                          |
 * | updateWorkspaceMemberRole  | PATCH  | /workspaces/:workspaceId/members/:userId          |
 * | removeWorkspaceMember      | DELETE | /workspaces/:workspaceId/members/:userId          |
 * | createProject              | POST   | /workspaces/:workspaceId/projects                 |
 * | getWorkspaceProjects       | GET    | /workspaces/:workspaceId/projects                 |
 * | getProjectById             | GET    | /workspaces/:workspaceId/projects/:projectId      |
 * | updateProject              | PATCH  | /workspaces/:workspaceId/projects/:projectId      |
 * | deleteProject              | DELETE | /workspaces/:workspaceId/projects/:projectId      |
 *
 * Note: Adding members uses the invitation flow (`POST /invitations/workspaces/:id/email`),
 * not a direct workspace members POST.
 */

export const createWorkspace = async (
  data: CreateWorkspaceInput,
): Promise<WorkspaceResponse> => {
  const response = await api.post<WorkspaceResponse>("/workspaces", data);
  return response.data;
};

export const getUserWorkspaces = async (): Promise<WorkspacesListResponse> => {
  const response = await api.get<WorkspacesListResponse>("/workspaces");
  return response.data;
};

export const getWorkspaceById = async (
  workspaceId: string,
): Promise<WorkspaceResponse> => {
  const response = await api.get<WorkspaceResponse>(
    `/workspaces/${workspaceId}`,
  );
  return response.data;
};

export const updateWorkspace = async ({
  workspaceId,
  data,
}: {
  workspaceId: string;
  data: UpdateWorkspaceInput;
}): Promise<WorkspaceResponse> => {
  const response = await api.patch<WorkspaceResponse>(
    `/workspaces/${workspaceId}`,
    data,
  );
  return response.data;
};

export const deleteWorkspace = async (
  workspaceId: string,
): Promise<WorkspaceMessageResponse> => {
  const response = await api.delete<WorkspaceMessageResponse>(
    `/workspaces/${workspaceId}`,
  );
  return response.data;
};

export const updateWorkspaceMemberRole = async (
  workspaceId: string,
  userId: string,
  data: UpdateWorkspaceMemberRoleInput,
): Promise<WorkspaceResponse> => {
  const response = await api.patch<WorkspaceResponse>(
    `/workspaces/${workspaceId}/members/${userId}`,
    data,
  );
  return response.data;
};

export const removeWorkspaceMember = async ({
  workspaceId,
  userId,
}: RemoveWorkspaceMemberInput): Promise<WorkspaceResponse> => {
  const response = await api.delete<WorkspaceResponse>(
    `/workspaces/${workspaceId}/members/${userId}`,
  );
  return response.data;
};

export const createProject = async (
  workspaceId: string,
  data: CreateWorkspaceProjectInput,
): Promise<WorkspaceProjectResponse> => {
  const response = await api.post<WorkspaceProjectResponse>(
    `/workspaces/${workspaceId}/projects`,
    data,
  );
  return response.data;
};

export const getWorkspaceProjects = async (
  workspaceId: string,
): Promise<WorkspaceProjectsListResponse> => {
  const response = await api.get<WorkspaceProjectsListResponse>(
    `/workspaces/${workspaceId}/projects`,
  );
  return response.data;
};

export const getProjectById = async (
  workspaceId: string,
  projectId: string,
): Promise<WorkspaceProjectResponse> => {
  const response = await api.get<WorkspaceProjectResponse>(
    `/workspaces/${workspaceId}/projects/${projectId}`,
  );
  return response.data;
};

export const updateProject = async (
  workspaceId: string,
  projectId: string,
  data: UpdateWorkspaceProjectInput,
): Promise<WorkspaceProjectResponse> => {
  const response = await api.patch<WorkspaceProjectResponse>(
    `/workspaces/${workspaceId}/projects/${projectId}`,
    data,
  );
  return response.data;
};

export const deleteProject = async (
  workspaceId: string,
  projectId: string,
): Promise<WorkspaceMessageResponse> => {
  const response = await api.delete<WorkspaceMessageResponse>(
    `/workspaces/${workspaceId}/projects/${projectId}`,
  );
  return response.data;
};
