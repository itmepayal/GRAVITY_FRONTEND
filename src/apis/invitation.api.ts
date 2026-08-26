import { api } from "@/lib/api";
import type {
  CreateEmailInvitationData,
  CreateInviteLinkData,
  InvitationResponse,
  InvitationsListResponse,
} from "@/types/invitation";
import type { MessageResponse } from "@/types/task";

/**
 * Invitation API — maps 1:1 to `server/src/modules/invitation/invitation.route.ts`
 *
 * | Client function         | Method | Server route                                    |
 * |-------------------------|--------|-------------------------------------------------|
 * | getInvitationByToken    | GET    | /invitations/:token                             |
 * | createEmailInvitation   | POST   | /invitations/workspaces/:workspaceId/email        |
 * | createInviteLink        | POST   | /invitations/workspaces/:workspaceId/link         |
 * | getWorkspaceInvitations | GET    | /invitations/workspaces/:workspaceId              |
 * | getMyPendingInvitations | GET    | /invitations/me/pending                           |
 * | acceptInvitation        | POST   | /invitations/:token/accept                        |
 * | rejectInvitation        | POST   | /invitations/:token/reject                        |
 * | joinViaInviteCode       | POST   | /invitations/:token/join                          |
 * | revokeInvitation        | DELETE | /invitations/workspaces/:workspaceId/:invitationId|
 */

export const getInvitationByToken = async (
  token: string,
): Promise<InvitationResponse> => {
  const response = await api.get<InvitationResponse>(`/invitations/${token}`);

  return response.data;
};

export const createEmailInvitation = async (
  workspaceId: string,
  data: CreateEmailInvitationData,
): Promise<InvitationResponse> => {
  const response = await api.post<InvitationResponse>(
    `/invitations/workspaces/${workspaceId}/email`,
    data,
  );

  return response.data;
};

export const createInviteLink = async (
  workspaceId: string,
  data: CreateInviteLinkData,
): Promise<InvitationResponse> => {
  const response = await api.post<InvitationResponse>(
    `/invitations/workspaces/${workspaceId}/link`,
    data,
  );

  return response.data;
};

export const getWorkspaceInvitations = async (
  workspaceId: string,
): Promise<InvitationsListResponse> => {
  const response = await api.get<InvitationsListResponse>(
    `/invitations/workspaces/${workspaceId}`,
  );

  return response.data;
};

export const getMyPendingInvitations =
  async (): Promise<InvitationsListResponse> => {
    const response = await api.get<InvitationsListResponse>(
      "/invitations/me/pending",
    );

    return response.data;
  };

export const acceptInvitation = async (
  token: string,
): Promise<InvitationResponse> => {
  const response = await api.post<InvitationResponse>(
    `/invitations/${token}/accept`,
  );

  return response.data;
};

export const rejectInvitation = async (
  token: string,
): Promise<InvitationResponse> => {
  const response = await api.post<InvitationResponse>(
    `/invitations/${token}/reject`,
  );

  return response.data;
};

export const joinViaInviteCode = async (
  token: string,
): Promise<InvitationResponse> => {
  const response = await api.post<InvitationResponse>(
    `/invitations/${token}/join`,
  );

  return response.data;
};

export const revokeInvitation = async (
  workspaceId: string,
  invitationId: string,
): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(
    `/invitations/workspaces/${workspaceId}/${invitationId}`,
  );

  return response.data;
};
