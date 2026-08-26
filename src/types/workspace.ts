import type { MessageResponse } from "@/types/auth";
import type {
  WorkspaceShareMode,
  WorkspaceSharingSettings,
} from "@/types/sharing";

export type WorkspaceMember = {
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

export type Workspace = {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPrivate?: boolean;
  shareMode?: WorkspaceShareMode;
  sharingSettings?: WorkspaceSharingSettings;
  owner?: {
    _id?: string;
    id?: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  members?: WorkspaceMember[];
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateWorkspaceInput = {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPrivate?: boolean;
  shareMode?: WorkspaceShareMode;
};

export type UpdateWorkspaceInput = {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isPrivate?: boolean;
  shareMode?: WorkspaceShareMode;
};

export type UpdateWorkspaceMemberRoleInput = {
  roleId: string;
};

export type CreateWorkspaceProjectInput = {
  name: string;
  description?: string;
  status?: string;
  color?: string;
  startDate?: string;
  dueDate?: string;
};

export type UpdateWorkspaceProjectInput = {
  name?: string;
  description?: string;
  status?: string;
  color?: string;
  startDate?: string;
  dueDate?: string;
  isArchived?: boolean;
};

export type WorkspaceResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Workspace;
};

export type WorkspacesListResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Workspace[];
};

export type WorkspaceProject = {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  status?: string;
  color?: string;
  workspace?: string;
  progress?: number;
  taskCount?: number;
  completedTaskCount?: number;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type WorkspaceProjectResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: WorkspaceProject;
};

export type WorkspaceProjectsListResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: WorkspaceProject[];
};

export type RemoveWorkspaceMemberInput = {
  workspaceId: string;
  userId: string;
};

export type { MessageResponse as WorkspaceMessageResponse };
