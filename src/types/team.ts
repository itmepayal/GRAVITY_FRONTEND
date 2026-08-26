export interface TeamUser {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface TeamMember {
  user: string | TeamUser;
  joinedAt: string;
}

export interface Team {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  workspace: string | { _id?: string; id?: string; name?: string };
  lead: string | TeamUser;
  members: TeamMember[];
  color?: string;
  createdBy?: string | TeamUser;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  lead: string;
  color?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  color?: string;
}

export interface AddTeamMemberRequest {
  userId: string;
}

export interface ChangeTeamLeadRequest {
  leadId: string;
}

export interface GetWorkspaceTeamsParams {
  page?: number;
  limit?: number;
}

export interface TeamResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Team;
}

export interface TeamsListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Team[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MessageResponse {
  success: boolean;
  statusCode: number;
  message: string;
}
