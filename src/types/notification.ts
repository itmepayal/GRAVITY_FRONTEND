export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "task_status_changed"
  | "comment_mention"
  | "comment_added"
  | "sprint_started"
  | "sprint_completed"
  | "workspace_invite"
  | "role_changed"
  | "project_added"
  | "due_date_reminder"
  | "system";

export type NotificationEntityType =
  | "task"
  | "project"
  | "sprint"
  | "workspace"
  | "comment"
  | "invitation"
  | "system";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface INotification {
  _id: string;
  id?: string;
  recipient: string;
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
  type: NotificationType;
  title: string;
  message: string;
  entityType?: NotificationEntityType;
  entityId?: string | null;
  linkUrl?: string;
  isRead: boolean;
  readAt?: string | null;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListNotificationsQueryParams {
  workspaceId?: string;
  isRead?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

export interface CreateNotificationPayload {
  recipient: string;
  workspace: string;
  project?: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: NotificationEntityType;
  entityId?: string;
  linkUrl?: string;
  priority?: NotificationPriority;
}
