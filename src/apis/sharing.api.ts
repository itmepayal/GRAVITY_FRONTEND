import { api } from "@/lib/api";
import type {
  UpdateWorkspaceSharingInput,
  WorkspaceSharingInfo,
  WorkspaceSharingResponse,
} from "@/types/sharing";
import type { WorkspaceResponse } from "@/types/workspace";

/**
 * Workspace sharing API
 *
 * | Client function          | Method | Server route                    |
 * |--------------------------|--------|---------------------------------|
 * | getWorkspaceSharing      | GET    | /workspaces/:id/sharing         |
 * | updateWorkspaceSharing   | PATCH  | /workspaces/:id/sharing         |
 */

export const getWorkspaceSharing = async (
  workspaceId: string,
): Promise<WorkspaceSharingResponse> => {
  const response = await api.get<WorkspaceSharingResponse>(
    `/workspaces/${workspaceId}/sharing`,
  );
  return response.data;
};

export const updateWorkspaceSharing = async (
  workspaceId: string,
  data: UpdateWorkspaceSharingInput,
): Promise<WorkspaceResponse> => {
  const response = await api.patch<WorkspaceResponse>(
    `/workspaces/${workspaceId}/sharing`,
    data,
  );
  return response.data;
};

export type { WorkspaceSharingInfo };
