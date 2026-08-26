import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Globe,
  Link as LinkIcon,
  Loader2,
  Lock,
  Mail,
  UserPlus,
  Users,
} from "lucide-react";
import { useGetWorkspaceSharing } from "@/hooks/queries/sharing/use-get-workspace-sharing";
import { useUpdateWorkspaceSharing } from "@/hooks/mutations/sharing/use-update-workspace-sharing";
import { useCreateEmailInvitation } from "@/hooks/mutations/invitation/use-create-email-invitation";
import { useCreateInviteLink } from "@/hooks/mutations/invitation/use-create-invite-link";
import { useGetWorkspaceInvitations } from "@/hooks/queries/invitation/use-get-workspace-invitations";
import { useRevokeInvitation } from "@/hooks/mutations/invitation/use-revoke-invitation";
import {
  LINK_EXPIRY_OPTIONS,
  LINK_PERMISSION_OPTIONS,
  SHARE_MODE_META,
  type LinkExpiryPreset,
  type LinkPermission,
  type WorkspaceShareMode,
} from "@/types/sharing";

const INK = "#0F2D29";
const TEAL = "#0F8A65";

interface WorkspaceShareSettingsProps {
  workspaceId: string;
  workspaceName?: string;
  roles?: { id?: string; _id?: string; name: string }[];
  /** Hide email invite block (e.g. when Members page has its own invite flow) */
  hideInviteSection?: boolean;
  /** Compact layout for embedding in Members page */
  compact?: boolean;
}

const MODE_ICONS = {
  lock: Lock,
  users: Users,
  link: LinkIcon,
} as const;

export function WorkspaceShareSettings({
  workspaceId,
  workspaceName = "this workspace",
  roles = [],
  hideInviteSection = false,
  compact = false,
}: WorkspaceShareSettingsProps) {
  const { data: sharingResponse, isLoading } = useGetWorkspaceSharing(workspaceId);
  const sharing = sharingResponse?.data;

  const { mutate: updateSharing, isPending: isUpdatingMode } =
    useUpdateWorkspaceSharing();
  const { mutate: sendInvite, isPending: isInviting } =
    useCreateEmailInvitation();
  const { mutate: generateLink, isPending: isGeneratingLink } =
    useCreateInviteLink();
  const { mutate: revokeInvite, isPending: isRevoking } = useRevokeInvitation();
  const { data: invitationsResponse } = useGetWorkspaceInvitations(workspaceId);

  const [email, setEmail] = useState("");
  const [emailRoleId, setEmailRoleId] = useState("");
  const [linkPermission, setLinkPermission] = useState<LinkPermission>("view");
  const [linkExpiryPreset, setLinkExpiryPreset] =
    useState<LinkExpiryPreset>("7d");
  const [customExpiryDate, setCustomExpiryDate] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const invitableRoles = useMemo(
    () => roles.filter((r) => r.name.toLowerCase() !== "owner"),
    [roles],
  );

  const defaultRoleId =
    invitableRoles.find((r) => r.name.toLowerCase() === "member")?.id ??
    invitableRoles.find((r) => r.name.toLowerCase() === "member")?._id ??
    invitableRoles[0]?.id ??
    invitableRoles[0]?._id ??
    "";

  useEffect(() => {
    if (!emailRoleId && defaultRoleId) {
      setEmailRoleId(defaultRoleId);
    }
  }, [defaultRoleId, emailRoleId]);

  useEffect(() => {
    if (sharing?.sharingSettings?.linkPermission) {
      setLinkPermission(sharing.sharingSettings.linkPermission);
    }
    if (sharing?.sharingSettings?.linkExpiryPreset) {
      setLinkExpiryPreset(sharing.sharingSettings.linkExpiryPreset);
    }
  }, [sharing]);

  const pendingInvitations = (invitationsResponse as any)?.data ?? [];
  const linkInvitations = pendingInvitations.filter(
    (inv: any) => inv.type === "link",
  );
  const emailInvitations = pendingInvitations.filter(
    (inv: any) => inv.type === "email",
  );

  const handleModeChange = (mode: WorkspaceShareMode) => {
    if (!workspaceId || sharing?.shareMode === mode) return;

    updateSharing({
      workspaceId,
      data: { shareMode: mode },
    });
  };

  const handleLinkDefaultsSave = () => {
    updateSharing({
      workspaceId,
      data: {
        linkPermission,
        linkExpiryPreset,
        ...(linkExpiryPreset === "custom" && customExpiryDate
          ? { linkExpiresAt: new Date(customExpiryDate).toISOString() }
          : {}),
      },
    });
  };

  const handleEmailInvite = () => {
    if (!email.trim() || !emailRoleId) return;

    sendInvite(
      {
        workspaceId,
        data: { email: email.trim(), roleId: emailRoleId },
      },
      {
        onSuccess: () => setEmail(""),
      },
    );
  };

  const handleGenerateLink = () => {
    generateLink(
      {
        workspaceId,
        data: {
          linkPermission,
          expiryPreset: linkExpiryPreset,
          ...(linkExpiryPreset === "custom" && customExpiryDate
            ? { expiresAt: new Date(customExpiryDate).toISOString() }
            : {}),
        },
      },
      {
        onSuccess: (response: any) => {
          const payload = response?.data ?? response;
          const link =
            payload?.inviteLink ??
            payload?.link ??
            payload?.url ??
            (payload?.token
              ? `${window.location.origin}/invite/${payload.token}`
              : null);
          setInviteLink(link);
          setCopied(false);
        },
      },
    );
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-[#0F8A65]" size={22} />
      </div>
    );
  }

  const currentMode = sharing?.shareMode ?? "private";

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div>
        <h2 className="text-[15px] font-bold text-[#0F2D29]">
          Sharing & Permissions
        </h2>
        <p className="text-[12px] text-[#5B6E68] mt-1">
          Control how people join and access{" "}
          <span className="font-semibold text-[#0F2D29]">{workspaceName}</span>.
        </p>
      </div>

      <div
        className={
          compact
            ? "grid grid-cols-1 sm:grid-cols-3 gap-2"
            : "grid grid-cols-1 md:grid-cols-3 gap-3"
        }
      >
        {(Object.keys(SHARE_MODE_META) as WorkspaceShareMode[]).map((mode) => {
          const meta = SHARE_MODE_META[mode];
          const Icon = MODE_ICONS[meta.icon];
          const isActive = currentMode === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => handleModeChange(mode)}
              disabled={isUpdatingMode}
              className={`text-left rounded-xl border p-3 transition-all ${
                isActive
                  ? "border-[#0F8A65] bg-[#8FE3C4]/10 shadow-sm"
                  : "border-[#0F2D29]/10 bg-white hover:border-[#0F8A65]/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-[#0F8A65]" />
                <span className="text-[13px] font-semibold text-[#0F2D29]">
                  {meta.label}
                </span>
                {isActive && <Check size={14} className="text-[#0F8A65] ml-auto" />}
              </div>
              <p className="text-[11.5px] text-[#5B6E68] leading-relaxed">
                {meta.description}
              </p>
            </button>
          );
        })}
      </div>

      {!hideInviteSection && (
      <div className="rounded-xl border border-[#0F2D29]/10 bg-[#F8F7F3]/50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-[#0F8A65]" />
          <h3 className="text-[13px] font-semibold text-[#0F2D29]">
            Invite by email
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="payal@example.com"
            className="flex-1 rounded-lg border border-[#0F2D29]/15 px-3 py-2 text-[13px]"
          />
          <select
            value={emailRoleId}
            onChange={(e) => setEmailRoleId(e.target.value)}
            className="rounded-lg border border-[#0F2D29]/15 px-3 py-2 text-[13px] min-w-36"
          >
            {invitableRoles.map((role) => (
              <option
                key={role.id ?? role._id}
                value={role.id ?? role._id}
              >
                {role.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleEmailInvite}
            disabled={isInviting || !email.trim() || !emailRoleId}
            className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: INK }}
          >
            {isInviting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <UserPlus size={14} />
            )}
            Invite
          </button>
        </div>

        {emailInvitations.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5B6E68]">
              Pending email invites ({emailInvitations.length})
            </p>
            {emailInvitations.map((inv: any) => (
              <div
                key={inv.id ?? inv._id}
                className="flex items-center justify-between rounded-lg border border-[#0F2D29]/8 px-3 py-2 text-[12px]"
              >
                <span>{inv.email}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#5B6E68]">{inv.role?.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      revokeInvite({
                        workspaceId,
                        invitationId: inv.id ?? inv._id,
                      })
                    }
                    disabled={isRevoking}
                    className="text-red-600 hover:underline"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {currentMode === "link" && (
        <div className="rounded-xl border border-[#0F2D29]/10 bg-[#F8F7F3]/50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[#0F8A65]" />
            <h3 className="text-[13px] font-semibold text-[#0F2D29]">
              Shareable link
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#5B6E68] uppercase">
                Link permission
              </label>
              <select
                value={linkPermission}
                onChange={(e) =>
                  setLinkPermission(e.target.value as LinkPermission)
                }
                className="mt-1 w-full rounded-lg border border-[#0F2D29]/15 px-3 py-2 text-[13px]"
              >
                {LINK_PERMISSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.roleHint})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#5B6E68] uppercase">
                Link expiry
              </label>
              <select
                value={linkExpiryPreset}
                onChange={(e) =>
                  setLinkExpiryPreset(e.target.value as LinkExpiryPreset)
                }
                className="mt-1 w-full rounded-lg border border-[#0F2D29]/15 px-3 py-2 text-[13px]"
              >
                {LINK_EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {linkExpiryPreset === "custom" && (
            <input
              type="datetime-local"
              value={customExpiryDate}
              onChange={(e) => setCustomExpiryDate(e.target.value)}
              className="w-full rounded-lg border border-[#0F2D29]/15 px-3 py-2 text-[13px]"
            />
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLinkDefaultsSave}
              disabled={isUpdatingMode}
              className="rounded-lg border border-[#0F2D29]/15 px-4 py-2 text-[12px] font-medium"
            >
              Save link defaults
            </button>
            <button
              type="button"
              onClick={handleGenerateLink}
              disabled={isGeneratingLink}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: TEAL }}
            >
              {isGeneratingLink ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <LinkIcon size={14} />
              )}
              Generate link
            </button>
            {inviteLink && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-[#0F2D29]/15 px-4 py-2 text-[12px] font-medium"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy link"}
              </button>
            )}
          </div>

          {inviteLink && (
            <p className="text-[11px] text-[#5B6E68] break-all rounded-lg bg-[#F7FAF9] p-3 border border-[#0F2D29]/8">
              {inviteLink}
            </p>
          )}

          {linkInvitations.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5B6E68]">
                Active links ({linkInvitations.length})
              </p>
              {linkInvitations.map((inv: any) => (
                <div
                  key={inv.id ?? inv._id}
                  className="flex items-center justify-between rounded-lg border border-[#0F2D29]/8 px-3 py-2 text-[12px]"
                >
                  <span>
                    {inv.linkPermission ?? inv.role?.name ?? "Link"} · uses{" "}
                    {inv.joinCount ?? 0}
                    {inv.maxUses ? ` / ${inv.maxUses}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      revokeInvite({
                        workspaceId,
                        invitationId: inv.id ?? inv._id,
                      })
                    }
                    disabled={isRevoking}
                    className="text-red-600 hover:underline"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentMode === "workspace_members" && (
        <div className="rounded-lg border border-[#0F8A65]/20 bg-[#8FE3C4]/10 px-3 py-2.5 text-[12px] text-[#0F2D29]">
          All {sharing?.memberCount ?? 0} workspace members can access content
          based on their role. Invite new people by email above.
        </div>
      )}

      {currentMode === "private" && (
        <div className="rounded-lg border border-[#0F2D29]/10 bg-[#F8F7F3] px-3 py-2.5 text-[12px] text-[#5B6E68]">
          This workspace is invite-only. Link sharing is disabled until you switch
          to Shareable Link mode.
        </div>
      )}
    </div>
  );
}
