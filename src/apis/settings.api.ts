/**
 * Settings API — maps all server routes used by Settings page
 *
 * Profile & account (user.route.ts)
 * | Client function                 | Method | Server route                          |
 * |---------------------------------|--------|---------------------------------------|
 * | getCurrentUser                  | GET    | /users/me                             |
 * | changeProfile                   | PATCH  | /users/profile                        |
 * | changePassword                  | POST   | /users/change-password                |
 * | updateNotificationPreferences   | PATCH  | /users/notifications/preferences      |
 * | deactivateAccount               | PATCH  | /users/account/deactivate             |
 * | deleteAccount                   | DELETE | /users/account                        |
 * | reactivateAccount               | POST   | /users/account/reactivate             |
 * | getUserById                     | GET    | /users/:userId                        |
 *
 * Auth & security (auth.router.ts)
 * | Client function                 | Method | Server route                          |
 * |---------------------------------|--------|---------------------------------------|
 * | logout                          | POST   | /auth/logout                          |
 * | linkGoogleAccount               | POST   | /auth/link/google                     |
 * | getSessions                     | GET    | /auth/sessions                        |
 * | revokeSession                   | DELETE | /auth/sessions/:sessionId             |
 * | revokeOtherSessions             | DELETE | /auth/sessions/others                 |
 * | enableTwoFA                     | PATCH  | /auth/2fa/enable                      |
 * | disableTwoFA                    | PATCH  | /auth/2fa/disable                     |
 *
 * Workspace (workspace.route.ts, role.route.ts, sharing.api.ts)
 * | Client function                 | Method | Server route                          |
 * |---------------------------------|--------|---------------------------------------|
 * | getUserWorkspaces               | GET    | /workspaces                           |
 * | getWorkspaceSharing             | GET    | /workspaces/:workspaceId/sharing      |
 * | getWorkspaceRoles               | GET    | /roles/:workspaceId                   |
 */

export {
  getCurrentUser,
  changeProfile,
  changePassword,
  updateNotificationPreferences,
  deactivateAccount,
  deleteAccount,
  reactivateAccount,
  getUserById,
} from "@/apis/user.api";

export {
  logout,
  linkGoogleAccount,
  getSessions,
  revokeSession,
  revokeOtherSessions,
  enableTwoFA,
  disableTwoFA,
} from "@/apis/auth.api";

export { getUserWorkspaces } from "@/apis/workspace.api";
export { getWorkspaceSharing } from "@/apis/sharing.api";
export { getWorkspaceRoles } from "@/apis/role.api";
