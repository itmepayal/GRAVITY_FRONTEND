export type InvitationStatus = "pending" | "accepted" | "rejected" | "revoked";

export type InvitationType = "email" | "link";

export interface Invitation {
  id: string;
  workspace: string;
  role: string;
  invitedBy: string;
  type: InvitationType;
  email?: string;
  token: string;
  status: InvitationStatus;
  acceptedBy?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailInvitationData {
  email: string;
  roleId: string;
  expiresInDays?: number;
}

export interface CreateInviteLinkData {
  roleId: string;
  expiresInDays?: number;
}

export interface InvitationResponse {
  success: boolean;
  message: string;
  data: Invitation;
}

export interface InvitationsListResponse {
  success: boolean;
  message: string;
  data: Invitation[];
}

export interface PopulatedInvitationWorkspace {
  _id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface PopulatedInvitationRole {
  _id: string;
  name: string;
}

export interface PopulatedInvitationInvitedBy {
  _id: string;
  name: string;
  email: string;
}

export interface PopulatedInvitation extends Omit<
  Invitation,
  "workspace" | "role" | "invitedBy"
> {
  workspace: PopulatedInvitationWorkspace;
  role: PopulatedInvitationRole;
  invitedBy: PopulatedInvitationInvitedBy;
}

export interface GetInvitationByTokenResponse {
  success: boolean;
  message: string;
  data: PopulatedInvitation;
}
