export type DocumentStatus = "draft" | "published" | "archived";

export interface IDocumentCollaborator {
  user: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
  permission: "view" | "edit";
  addedAt: string;
}

export interface IDocumentVersion {
  content: string;
  editedBy: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
  editedAt: string;
}

export interface IDocument {
  _id: string;
  id?: string;
  title: string;
  content: string;
  workspace: string;
  project?: { _id: string; name: string } | string | null;
  folder?: { _id: string; name: string } | string | null;
  status: DocumentStatus;
  icon?: string;
  coverImage?: string;
  parentDocument?: string | null;
  collaborators: IDocumentCollaborator[];
  versions?: IDocumentVersion[];
  tags: string[];
  isArchived: boolean;
  archivedAt?: string | null;
  lastEditedBy: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
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

export interface ListDocumentsQueryParams {
  workspace: string;
  project?: string;
  folder?: string;
  status?: DocumentStatus;
  isArchived?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateDocumentPayload {
  title?: string;
  content?: string;
  workspace: string;
  project?: string;
  folder?: string;
  parentDocument?: string;
  icon?: string;
  coverImage?: string;
  tags?: string[];
}

export interface UpdateDocumentPayload {
  title?: string;
  content?: string;
  status?: DocumentStatus;
  icon?: string;
  coverImage?: string;
  tags?: string[];
  folder?: string;
}
