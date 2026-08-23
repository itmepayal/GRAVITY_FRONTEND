import { api } from "@/lib/api";
import type {
  IDocument,
  ListDocumentsQueryParams,
  CreateDocumentPayload,
  UpdateDocumentPayload,
} from "@/types/document";

export interface DocumentsListResponse {
  success: boolean;
  message: string;
  data: {
    documents: IDocument[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface DocumentSingleResponse {
  success: boolean;
  message: string;
  data: IDocument;
}

export const createDocument = async (
  payload: CreateDocumentPayload,
): Promise<DocumentSingleResponse> => {
  const response = await api.post<DocumentSingleResponse>("/documents", payload);
  return response.data;
};

export const listDocuments = async (
  params: ListDocumentsQueryParams,
): Promise<DocumentsListResponse> => {
  const response = await api.get<DocumentsListResponse>("/documents", {
    params,
  });
  return response.data;
};

export const getDocumentById = async (
  id: string,
): Promise<DocumentSingleResponse> => {
  const response = await api.get<DocumentSingleResponse>(`/documents/${id}`);
  return response.data;
};

export const updateDocument = async (
  id: string,
  payload: UpdateDocumentPayload,
): Promise<DocumentSingleResponse> => {
  const response = await api.patch<DocumentSingleResponse>(`/documents/${id}`, payload);
  return response.data;
};

export const archiveDocument = async (
  id: string,
): Promise<DocumentSingleResponse> => {
  const response = await api.patch<DocumentSingleResponse>(`/documents/${id}/archive`);
  return response.data;
};

export const restoreDocument = async (
  id: string,
): Promise<DocumentSingleResponse> => {
  const response = await api.patch<DocumentSingleResponse>(`/documents/${id}/restore`);
  return response.data;
};

export const deleteDocument = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/documents/${id}`);
  return response.data;
};

export const addCollaborator = async (
  id: string,
  payload: { userId: string; permission?: "view" | "edit" },
): Promise<DocumentSingleResponse> => {
  const response = await api.post<DocumentSingleResponse>(`/documents/${id}/collaborators`, payload);
  return response.data;
};

export const removeCollaborator = async (
  id: string,
  userId: string,
): Promise<DocumentSingleResponse> => {
  const response = await api.delete<DocumentSingleResponse>(`/documents/${id}/collaborators/${userId}`);
  return response.data;
};
