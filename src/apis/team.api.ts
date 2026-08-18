import { api } from "@/lib/api";
import type {
  TeamResponse,
  TeamsListResponse,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest,
  ChangeTeamLeadRequest,
  MessageResponse,
} from "@/types/team";

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
): Promise<TeamsListResponse> => {
  const response = await api.get<TeamsListResponse>(
    `/teams/workspaces/${workspaceId}/teams`,
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
