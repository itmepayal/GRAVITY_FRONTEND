import { api } from "@/lib/api";
import type {
  IFile,
  IFolder,
  GetWorkspaceFilesParams,
  GetWorkspaceFoldersParams,
  CreateFolderData,
} from "@/types/file";

export interface FilesResponse {
  success: boolean;
  message: string;
  data: IFile[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FileSingleResponse {
  success: boolean;
  message: string;
  data: IFile;
}

export interface FoldersResponse {
  success: boolean;
  message: string;
  data: IFolder[];
}

export interface FolderSingleResponse {
  success: boolean;
  message: string;
  data: IFolder;
}

// ---------------- FILES APIs ----------------

export const uploadFile = async (formData: FormData): Promise<FileSingleResponse> => {
  const response = await api.post<FileSingleResponse>("/files/upload", formData, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
};

export const getWorkspaceFiles = async (
  workspaceId: string,
  params?: GetWorkspaceFilesParams,
): Promise<FilesResponse> => {
  const response = await api.get<FilesResponse>(`/files/workspace/${workspaceId}`, {
    params,
  });
  return response.data;
};

export const getFileById = async (fileId: string): Promise<FileSingleResponse> => {
  const response = await api.get<FileSingleResponse>(`/files/${fileId}`);
  return response.data;
};

export const moveFile = async (
  fileId: string,
  folderId: string | null,
): Promise<FileSingleResponse> => {
  const response = await api.patch<FileSingleResponse>(`/files/${fileId}/move`, {
    folder: folderId,
  });
  return response.data;
};

export const updateFile = async (
  fileId: string,
  data: { name?: string; description?: string; tags?: string[] },
): Promise<FileSingleResponse> => {
  const response = await api.patch<FileSingleResponse>(`/files/${fileId}`, data);
  return response.data;
};

export const archiveFile = async (
  fileId: string,
  isArchived?: boolean,
): Promise<FileSingleResponse> => {
  const response = await api.patch<FileSingleResponse>(`/files/${fileId}/archive`, {
    isArchived,
  });
  return response.data;
};

export const deleteFile = async (fileId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/files/${fileId}`);
  return response.data;
};

// ---------------- FOLDERS APIs ----------------

export const createFolder = async (data: CreateFolderData): Promise<FolderSingleResponse> => {
  const response = await api.post<FolderSingleResponse>("/folders", data);
  return response.data;
};

export const getWorkspaceFolders = async (
  workspaceId: string,
  params?: GetWorkspaceFoldersParams,
): Promise<FoldersResponse> => {
  const response = await api.get<FoldersResponse>(`/folders/workspace/${workspaceId}`, {
    params,
  });
  return response.data;
};

export const updateFolder = async (
  folderId: string,
  data: { name?: string; color?: string; parentFolder?: string | null },
): Promise<FolderSingleResponse> => {
  const response = await api.patch<FolderSingleResponse>(`/folders/${folderId}`, data);
  return response.data;
};

export const deleteFolder = async (
  folderId: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/folders/${folderId}`);
  return response.data;
};
