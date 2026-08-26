/**
 * Workspace Members API — maps all server routes used by Members page
 *
 * Workspace members (workspace.route.ts)
 * | Client function           | Method | Server route                               |
 * |---------------------------|--------|--------------------------------------------|
 * | getWorkspaceMembers       | GET    | /workspaces/:workspaceId (members[])       |
 * | updateWorkspaceMemberRole | PATCH  | /workspaces/:workspaceId/members/:userId     |
 * | removeWorkspaceMember     | DELETE | /workspaces/:workspaceId/members/:userId     |
 *
 * Invitations (invitation.route.ts)
 * | Client function           | Method | Server route                               |
 * |---------------------------|--------|--------------------------------------------|
 * | inviteMemberByEmail       | POST   | /invitations/workspaces/:workspaceId/email |
 * | createMemberInviteLink    | POST   | /invitations/workspaces/:workspaceId/link  |
 * | getWorkspaceInvitations   | GET    | /invitations/workspaces/:workspaceId         |
 * | revokeInvitation          | DELETE | /invitations/workspaces/:id/:invitationId    |
 * | getMyPendingInvitations   | GET    | /invitations/me/pending                      |
 * | acceptInvitation          | POST   | /invitations/:token/accept                   |
 * | rejectInvitation          | POST   | /invitations/:token/reject                   |
 * | joinViaInviteLink         | POST   | /invitations/:token/join                     |
 * | getInvitationByToken      | GET    | /invitations/:token                          |
 *
 * Sharing (workspace.route.ts)
 * | Client function           | Method | Server route                               |
 * |---------------------------|--------|--------------------------------------------|
 * | getWorkspaceSharing       | GET    | /workspaces/:workspaceId/sharing             |
 * | updateWorkspaceSharing    | PATCH  | /workspaces/:workspaceId/sharing             |
 *
 * Roles (role.route.ts)
 * | Client function           | Method | Server route                               |
 * |---------------------------|--------|--------------------------------------------|
 * | getWorkspaceRoles         | GET    | /roles/:workspaceId                          |
 */

export {
  getWorkspaceById as getWorkspaceMembers,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from "@/apis/workspace.api";

export {
  createEmailInvitation as inviteMemberByEmail,
  createInviteLink as createMemberInviteLink,
  getWorkspaceInvitations,
  revokeInvitation,
  getMyPendingInvitations,
  acceptInvitation,
  rejectInvitation,
  joinViaInviteCode as joinViaInviteLink,
  getInvitationByToken,
} from "@/apis/invitation.api";

export {
  getWorkspaceSharing,
  updateWorkspaceSharing,
} from "@/apis/sharing.api";

export { getWorkspaceRoles } from "@/apis/role.api";
