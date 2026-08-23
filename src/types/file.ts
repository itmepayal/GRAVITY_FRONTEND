export type FileEntityType = "project" | "task" | "workspace" | "standalone";

export interface IFile {
  _id: string;
  id?: string;
  name: string;
  originalName: string;
  fileUrl: string;
  publicId: string;
  fileType: string;
  extension: string;
  fileSize: number;
  workspace: string;
  project?: { _id: string; name: string } | string | null;
  task?: { _id: string; title: string } | string | null;
  folder?: { _id: string; name: string } | string | null;
  entityType: FileEntityType;
  description?: string;
  tags: string[];
  uploadedBy: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
  isArchived: boolean;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IFolder {
  _id: string;
  id?: string;
  name: string;
  workspace: string;
  project?: { _id: string; name: string } | string | null;
  parentFolder?: { _id: string; name: string } | string | null;
  color?: string;
  createdBy: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetWorkspaceFilesParams {
  project?: string;
  task?: string;
  folder?: string | null;
  entityType?: string;
  search?: string;
  isArchived?: boolean;
  page?: number;
  limit?: number;
}

export interface GetWorkspaceFoldersParams {
  project?: string;
  parentFolder?: string | null;
}

export interface CreateFolderData {
  name: string;
  workspace: string;
  project?: string | null;
  parentFolder?: string | null;
  color?: string;
}
