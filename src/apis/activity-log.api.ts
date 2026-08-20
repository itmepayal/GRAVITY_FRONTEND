import { api } from "@/lib/api";

export type ActivityEntityType =
    | "project"
    | "task"
    | "board"
    | "sprint"
    | "goal"
    | "team"
    | "workspace";

export type ActivityAction =
    | "created"
    | "updated"
    | "deleted"
    | "status_changed"
    | "assigned"
    | "commented"
    | "member_added"
    | "member_removed";

export interface ActivityLogActor {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface ActivityLog {
    _id: string;
    id?: string;
    workspace: string;
    actor: ActivityLogActor | string;
    action: ActivityAction;
    entityType: ActivityEntityType;
    entityId: string;
    entityName?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export interface ActivityLogResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: ActivityLog[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface GetWorkspaceActivityLogsParams {
    entityType?: ActivityEntityType;
    action?: ActivityAction;
    actor?: string;
    page?: number;
    limit?: number;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface CreateActivityLogData {
    workspace: string;
    action: ActivityAction;
    entityType: ActivityEntityType;
    entityId: string;
    entityName?: string;
    metadata?: Record<string, unknown>;
}

// Get workspace activity logs
export const getWorkspaceActivityLogs = async (
    workspaceId: string,
    params?: GetWorkspaceActivityLogsParams,
): Promise<ActivityLogResponse> => {
    const response = await api.get<ActivityLogResponse>(
        `/activity-logs/workspace/${workspaceId}`,
        {
            params,
        },
    );

    return response.data;
};

// Get activity logs for a specific entity
export const getEntityActivityLogs = async (
    entityType: ActivityEntityType,
    entityId: string,
    params?: PaginationParams,
): Promise<ActivityLogResponse> => {
    const response = await api.get<ActivityLogResponse>(
        `/activity-logs/entity/${entityType}/${entityId}`,
        {
            params,
        },
    );

    return response.data;
};

// Create activity log
export const createActivityLog = async (
    data: CreateActivityLogData,
): Promise<{ success: boolean; data: ActivityLog; message: string }> => {
    const response = await api.post<{ success: boolean; data: ActivityLog; message: string }>("/activity-logs", data);

    return response.data;
};