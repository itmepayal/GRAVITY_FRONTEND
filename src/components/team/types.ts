import type { Team, TeamUser, TeamMember } from "@/types/team";

export type TeamViewMode = "grid" | "table" | "detail";

export interface NormalizedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  color: string;
}

export interface NormalizedTeamMember {
  user: NormalizedUser;
  joinedAt: string;
}

export interface NormalizedTeam {
  id: string;
  rawId: string;
  name: string;
  description: string;
  workspaceId: string;
  workspaceName?: string;
  color: string;
  lead: NormalizedUser;
  members: NormalizedTeamMember[];
  createdBy?: NormalizedUser;
  createdAt: string;
  updatedAt?: string;
}

// Diverse, rich color palette for Team Color Tags & User Avatars
export const BRAND_TEAM_PALETTE = [
  "#0F2D29", // Signature Brand Dark Green
  "#0F8A65", // Signature Mint Accent
  "#6366F1", // Indigo
  "#EC4899", // Vibrant Rose / Pink
  "#F59E0B", // Amber Gold
  "#10B981", // Emerald Green
  "#3B82F6", // Royal Blue
  "#8B5CF6", // Deep Purple
  "#EF4444", // Crimson Red
  "#14B8A6", // Teal
  "#F97316", // Bright Orange
  "#06B6D4", // Cyan
];

export function getUserColor(idOrName: string): string {
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BRAND_TEAM_PALETTE.length;
  return BRAND_TEAM_PALETTE[index];
}

export function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function normalizeUser(user: string | TeamUser | any): NormalizedUser {
  if (!user) {
    return {
      id: "unknown",
      name: "Unassigned",
      email: "",
      initials: "UN",
      color: "#8FA69E",
    };
  }

  if (typeof user === "string") {
    return {
      id: user,
      name: `User ${user.slice(-4)}`,
      email: "",
      initials: user.slice(0, 2).toUpperCase(),
      color: getUserColor(user),
    };
  }

  const id = user.id || user._id || "unknown";
  const name = user.name || "Unknown User";
  const email = user.email || "";
  const avatar = user.avatar || undefined;

  return {
    id,
    name,
    email,
    avatar,
    initials: getInitials(name),
    color: getUserColor(id + name),
  };
}

export function normalizeTeamData(team: any): NormalizedTeam {
  const rawId = team._id || team.id || "";
  const id = rawId;
  const name = team.name || "Untitled Team";
  const description = team.description || "";
  const color = team.color || "#0F2D29";

  const workspaceId =
    typeof team.workspace === "string"
      ? team.workspace
      : team.workspace?._id || team.workspace?.id || "";

  const workspaceName =
    typeof team.workspace === "object" ? team.workspace?.name : undefined;

  const lead = normalizeUser(team.lead);

  const members: NormalizedTeamMember[] = Array.isArray(team.members)
    ? team.members.map((m: any) => ({
        user: normalizeUser(m.user),
        joinedAt: m.joinedAt || team.createdAt || new Date().toISOString(),
      }))
    : [];

  const createdBy = team.createdBy ? normalizeUser(team.createdBy) : undefined;
  const createdAt = team.createdAt || new Date().toISOString();
  const updatedAt = team.updatedAt;

  return {
    id,
    rawId,
    name,
    description,
    workspaceId,
    workspaceName,
    color,
    lead,
    members,
    createdBy,
    createdAt,
    updatedAt,
  };
}
