import { api } from "@/lib/api";
import type {
  AddTeamMemberRequest,
  ChangeTeamLeadRequest,
  CreateTeamRequest,
  GetWorkspaceTeamsParams,
  MessageResponse,
  TeamResponse,
  TeamsListResponse,
  UpdateTeamRequest,
} from "@/types/team";

/**
 * Team API — maps 1:1 to server routes in `server/src/modules/team/team.route.ts`
 *
 * | Client function     | Method | Server route                                    |
 * |---------------------|--------|-------------------------------------------------|
 * | createTeam          | POST   | /teams/workspaces/:workspaceId/teams            |
 * | getWorkspaceTeams   | GET    | /teams/workspaces/:workspaceId/teams            |
 * | getTeamById         | GET    | /teams/:teamId                                  |
 * | updateTeam          | PATCH  | /teams/:teamId                                  |
 * | deleteTeam          | DELETE | /teams/:teamId                                  |
 * | addTeamMember       | POST   | /teams/:teamId/members                          |
 * | removeTeamMember    | DELETE | /teams/:teamId/members/:userId                  |
 * | changeTeamLead      | PATCH  | /teams/:teamId/lead                             |
 */

export const createTeam = async (
  workspaceId: string,
  data: CreateTeamRequest,
): Promise<TeamResponse> => {
  const response = await api.post<TeamResponse>(
    `/teams/workspaces/${workspaceId}/teams`,
    data,
  );
  return response.data;
};

export const getWorkspaceTeams = async (
  workspaceId: string,
  params?: GetWorkspaceTeamsParams,
): Promise<TeamsListResponse> => {
  const response = await api.get<TeamsListResponse>(
    `/teams/workspaces/${workspaceId}/teams`,
    { params },
  );
  return response.data;
};

export const getTeamById = async (teamId: string): Promise<TeamResponse> => {
  const response = await api.get<TeamResponse>(`/teams/${teamId}`);
  return response.data;
};

export const updateTeam = async (
  teamId: string,
  data: UpdateTeamRequest,
): Promise<TeamResponse> => {
  const response = await api.patch<TeamResponse>(`/teams/${teamId}`, data);
  return response.data;
};

export const deleteTeam = async (teamId: string): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(`/teams/${teamId}`);
  return response.data;
};

export const addTeamMember = async (
  teamId: string,
  data: AddTeamMemberRequest,
): Promise<TeamResponse> => {
  const response = await api.post<TeamResponse>(
    `/teams/${teamId}/members`,
    data,
  );
  return response.data;
};

export const removeTeamMember = async (
  teamId: string,
  userId: string,
): Promise<TeamResponse> => {
  const response = await api.delete<TeamResponse>(
    `/teams/${teamId}/members/${userId}`,
  );
  return response.data;
};

export const changeTeamLead = async (
  teamId: string,
  data: ChangeTeamLeadRequest,
): Promise<TeamResponse> => {
  const response = await api.patch<TeamResponse>(`/teams/${teamId}/lead`, data);
  return response.data;
};
