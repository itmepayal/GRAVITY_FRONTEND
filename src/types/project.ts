import type { MessageResponse } from "@/types/auth";
import type { WorkspaceProject } from "@/types/workspace";

export type ProjectMember = {
  user: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: string | { _id?: string; id?: string; name: string };
  joinedAt: string;
};

export type Project = WorkspaceProject & {
  members?: ProjectMember[];
  owner?: {
    _id?: string;
    id?: string;
    name: string;
    email?: string;
    avatar?: string;
  };
};

export type AddProjectMemberInput = {
  userId: string;
  roleId: string;
};

export type UpdateProjectMemberRoleInput = {
  roleId: string;
};

export type CreateProjectBoardInput = {
  name: string;
  description?: string;
  type?: "kanban" | "scrum" | string;
};

export type CreateProjectSprintInput = {
  name: string;
  goal?: string | null;
  board?: string;
  startDate: string;
  endDate: string;
};

export type GetProjectTasksParams = {
  status?: string;
  priority?: string;
  assignee?: string;
  isArchived?: boolean | "true" | "false";
};

export type ProjectBoard = {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  type?: string;
  project?: string;
  workspace?: string;
  columns?: string[];
};

export type ProjectSprint = {
  _id: string;
  id?: string;
  name: string;
  goal?: string;
  board?: string;
  startDate: string;
  endDate: string;
  status?: "planned" | "active" | "completed";
};

export type ProjectResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Project;
};

export type ProjectBoardsListResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: ProjectBoard[];
};

export type ProjectBoardResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: ProjectBoard;
};

export type ProjectSprintsListResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: ProjectSprint[];
};

export type ProjectSprintResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: ProjectSprint;
};

export type ProjectTasksListResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: unknown[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type { MessageResponse as ProjectMessageResponse };
