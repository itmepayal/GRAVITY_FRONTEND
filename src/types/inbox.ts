export type InboxItemType =
  | "mention"
  | "assignment"
  | "comment"
  | "system"
  | "update"
  | "direct_message";

export type InboxItemStatus = "unread" | "read" | "archived" | "starred";

export type InboxEntityType =
  | "task"
  | "comment"
  | "project"
  | "workspace"
  | "direct";

export interface IInboxItem {
  _id: string;
  id?: string;
  user: string;
  sender?: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  workspace: {
    _id: string;
    id?: string;
    name: string;
  } | string;
  project?: {
    _id: string;
    id?: string;
    name: string;
  } | string | null;
  task?: {
    _id: string;
    id?: string;
    title: string;
    taskKey?: string;
  } | string | null;
  type: InboxItemType;
  subject: string;
  body: string;
  entityType?: InboxEntityType;
  entityId?: string | null;
  actionUrl?: string;
  status: InboxItemStatus;
  isStarred: boolean;
  isArchived: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListInboxQueryParams {
  workspaceId?: string;
  status?: InboxItemStatus;
  isStarred?: boolean;
  isArchived?: boolean;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateInboxItemPayload {
  user: string;
  workspace: string;
  project?: string;
  task?: string;
  type: InboxItemType;
  subject: string;
  body: string;
  entityType?: InboxEntityType;
  entityId?: string;
  actionUrl?: string;
}
