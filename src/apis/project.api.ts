import { api } from "@/lib/api";
import type {
  AddProjectMemberInput,
  CreateProjectBoardInput,
  CreateProjectSprintInput,
  GetProjectTasksParams,
  ProjectBoardResponse,
  ProjectBoardsListResponse,
  ProjectMessageResponse,
  ProjectResponse,
  ProjectSprintResponse,
  ProjectSprintsListResponse,
  ProjectTasksListResponse,
  UpdateProjectMemberRoleInput,
} from "@/types/project";

/**
 * Project API — maps 1:1 to server routes in `server/src/modules/project/project.route.ts`
 *
 * Workspace-scoped project CRUD lives in `workspace.api.ts`:
 * - POST   /workspaces/:workspaceId/projects
 * - GET    /workspaces/:workspaceId/projects
 * - GET    /workspaces/:workspaceId/projects/:projectId
 * - PATCH  /workspaces/:workspaceId/projects/:projectId
 * - DELETE /workspaces/:workspaceId/projects/:projectId
 *
 * | Client function           | Method | Server route                         |
 * |---------------------------|--------|--------------------------------------|
 * | addProjectMember          | POST   | /projects/:projectId/members         |
 * | updateProjectMemberRole   | PATCH  | /projects/:projectId/members/:userId |
 * | removeProjectMember       | DELETE | /projects/:projectId/members/:userId |
 * | createBoard               | POST   | /projects/:projectId/boards          |
 * | listBoards                | GET    | /projects/:projectId/boards          |
 * | createSprint              | POST   | /projects/:projectId/sprints         |
 * | getProjectSprints         | GET    | /projects/:projectId/sprints         |
 * | getProjectTasks           | GET    | /projects/:projectId/tasks           |
 */

export const addProjectMember = async (
  projectId: string,
  data: AddProjectMemberInput,
): Promise<ProjectResponse> => {
  const response = await api.post<ProjectResponse>(
    `/projects/${projectId}/members`,
    data,
  );
  return response.data;
};

export const updateProjectMemberRole = async (
  projectId: string,
  userId: string,
  data: UpdateProjectMemberRoleInput,
): Promise<ProjectResponse> => {
  const response = await api.patch<ProjectResponse>(
    `/projects/${projectId}/members/${userId}`,
    data,
  );
  return response.data;
};

export const removeProjectMember = async (
  projectId: string,
  userId: string,
): Promise<ProjectResponse> => {
  const response = await api.delete<ProjectResponse>(
    `/projects/${projectId}/members/${userId}`,
  );
  return response.data;
};

export const createBoard = async (
  projectId: string,
  data: CreateProjectBoardInput,
): Promise<ProjectBoardResponse> => {
  const response = await api.post<ProjectBoardResponse>(
    `/projects/${projectId}/boards`,
    data,
  );
  return response.data;
};

export const listBoards = async (
  projectId: string,
): Promise<ProjectBoardsListResponse> => {
  const response = await api.get<ProjectBoardsListResponse>(
    `/projects/${projectId}/boards`,
  );
  return response.data;
};

export const createSprint = async (
  projectId: string,
  data: CreateProjectSprintInput,
): Promise<ProjectSprintResponse> => {
  const response = await api.post<ProjectSprintResponse>(
    `/projects/${projectId}/sprints`,
    data,
  );
  return response.data;
};

export const getProjectSprints = async (
  projectId: string,
): Promise<ProjectSprintsListResponse> => {
  const response = await api.get<ProjectSprintsListResponse>(
    `/projects/${projectId}/sprints`,
  );
  return response.data;
};

export const getProjectTasks = async (
  projectId: string,
  params?: GetProjectTasksParams,
): Promise<ProjectTasksListResponse> => {
  const response = await api.get<ProjectTasksListResponse>(
    `/projects/${projectId}/tasks`,
    {
      params: {
        ...params,
        isArchived:
          params?.isArchived === true
            ? "true"
            : params?.isArchived === false
              ? "false"
              : params?.isArchived,
      },
    },
  );
  return response.data;
};

export type { ProjectMessageResponse };
