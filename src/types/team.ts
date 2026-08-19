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

// ====================
// Request Types
// ====================

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
  userId?: string;
  leadId?: string;
}

// ====================
// Response Types
// ====================

export interface TeamResponse {
  success: boolean;
  message: string;
  data: Team;
}

export interface TeamsListResponse {
  success: boolean;
  message: string;
  data: Team[];
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

