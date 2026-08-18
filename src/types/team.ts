export interface TeamMember {
  user: string;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;

  workspace: string;

  lead: string;
  members: TeamMember[];

  color?: string;

  createdBy: string;

  createdAt: string;
  updatedAt: string;
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
  userId: string;
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
