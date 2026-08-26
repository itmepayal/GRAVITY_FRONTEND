export type WorkspaceShareMode = "private" | "workspace_members" | "link";

export type LinkPermission = "view" | "comment" | "edit";

export type LinkExpiryPreset = "never" | "24h" | "7d" | "custom";

export type WorkspaceSharingSettings = {
  linkPermission?: LinkPermission;
  linkExpiryPreset?: LinkExpiryPreset;
  linkExpiresAt?: string;
  defaultMemberRoleId?: string;
};

export type WorkspaceSharingInfo = {
  workspaceId: string;
  shareMode: WorkspaceShareMode;
  isPrivate: boolean;
  sharingSettings: WorkspaceSharingSettings;
  memberCount: number;
  activeLinkCount: number;
  pendingEmailInviteCount: number;
};

export type UpdateWorkspaceSharingInput = {
  shareMode?: WorkspaceShareMode;
  linkPermission?: LinkPermission;
  linkExpiryPreset?: LinkExpiryPreset;
  linkExpiresAt?: string;
  defaultMemberRoleId?: string;
};

export type WorkspaceSharingResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: WorkspaceSharingInfo;
};

export const SHARE_MODE_META: Record<
  WorkspaceShareMode,
  { label: string; description: string; icon: "lock" | "users" | "link" }
> = {
  private: {
    label: "Private",
    description: "Only invited users can access this workspace.",
    icon: "lock",
  },
  workspace_members: {
    label: "Workspace Members",
    description: "All workspace members can access content by role.",
    icon: "users",
  },
  link: {
    label: "Shareable Link",
    description: "Anyone with the link can join (logged-in users).",
    icon: "link",
  },
};

export const LINK_PERMISSION_OPTIONS: {
  value: LinkPermission;
  label: string;
  roleHint: string;
}[] = [
  { value: "view", label: "View", roleHint: "Viewer" },
  { value: "comment", label: "Comment", roleHint: "Commenter" },
  { value: "edit", label: "Edit", roleHint: "Member" },
];

export const LINK_EXPIRY_OPTIONS: {
  value: LinkExpiryPreset;
  label: string;
}[] = [
  { value: "never", label: "Never" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "custom", label: "Custom date" },
];
