import type { FC } from "react";
import {
  X,
  UserPlus,
  Link as LinkIcon,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { FONT_GOLDMAN } from "@/components/common/design-system";

const INK = "#0F2D29";
const TEAL = "#0F8A65";
const MINT = "#8FE3C4";

interface WorkspaceInviteModalProps {
  workspaceName: string;
  inviteEmail: string;
  onInviteEmailChange: (email: string) => void;
  inviteRoleId: string;
  onInviteRoleIdChange: (roleId: string) => void;
  linkRoleId: string;
  onLinkRoleIdChange: (roleId: string) => void;
  inviteLink: string | null;
  copied: boolean;
  roles: { id: string; name: string }[];
  invitableUsers: { id?: string; _id?: string; name: string; email: string }[];
  isLoadingUsers?: boolean;
  isInviting?: boolean;
  isGeneratingLink?: boolean;
  onClose: () => void;
  onInvite: () => void;
  onGenerateLink: () => void;
  onCopyLink: () => void;
}

export const WorkspaceInviteModal: FC<WorkspaceInviteModalProps> = ({
  workspaceName,
  inviteEmail,
  onInviteEmailChange,
  inviteRoleId,
  onInviteRoleIdChange,
  linkRoleId,
  onLinkRoleIdChange,
  inviteLink,
  copied,
  roles,
  invitableUsers,
  isLoadingUsers,
  isInviting,
  isGeneratingLink,
  onClose,
  onInvite,
  onGenerateLink,
  onCopyLink,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-md border bg-white shadow-2xl"
      style={{ borderColor: `${INK}22` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="flex items-center justify-between gap-4 px-6 py-5"
        style={{ backgroundColor: INK }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center"
            style={{ backgroundColor: TEAL }}
          >
            <UserPlus size={18} color="white" />
          </div>
          <div className="min-w-0">
            <p className={`text-base font-black leading-none text-white ${FONT_GOLDMAN}`}>
              Invite Teammate
            </p>
            <p
              className="mt-1 truncate text-xs font-medium"
              style={{ color: `${MINT}CC` }}
            >
              {workspaceName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-white/70 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#0F2D29]">
            User
          </label>
          <select
            value={inviteEmail}
            onChange={(e) => onInviteEmailChange(e.target.value)}
            disabled={isLoadingUsers}
            className="w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65] disabled:opacity-50"
            style={{ borderColor: `${INK}22`, color: INK }}
          >
            <option value="">
              {isLoadingUsers ? "Loading users..." : "Select a user"}
            </option>
            {invitableUsers.map((u) => (
              <option key={u.id ?? u._id} value={u.email}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#0F2D29]">
            Role
          </label>
          <select
            value={inviteRoleId}
            onChange={(e) => onInviteRoleIdChange(e.target.value)}
            className="w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
            style={{ borderColor: `${INK}22`, color: INK }}
          >
            <option value="">Select role</option>
            {roles
              .filter((r) => r.name !== "Owner")
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-[#0F2D29]/10" />
          <span className="text-[10px] font-bold uppercase text-[#8FA69E]">
            Or
          </span>
          <div className="h-px flex-1 bg-[#0F2D29]/10" />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#0F2D29]">
            <LinkIcon size={12} />
            Invite via link
          </label>
          <select
            value={linkRoleId}
            onChange={(e) => onLinkRoleIdChange(e.target.value)}
            className="mb-3 w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
            style={{ borderColor: `${INK}22`, color: INK }}
          >
            <option value="">Select role for link</option>
            {roles
              .filter((r) => r.name !== "Owner")
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>

          {!inviteLink ? (
            <button
              type="button"
              onClick={onGenerateLink}
              disabled={!linkRoleId || isGeneratingLink}
              className="flex w-full items-center justify-center gap-1.5 border px-3.5 py-2.5 text-xs font-bold disabled:opacity-50"
              style={{ borderColor: `${INK}22`, color: INK }}
            >
              {isGeneratingLink ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <LinkIcon size={13} />
                  Generate invite link
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteLink}
                className="min-w-0 flex-1 border bg-[#0F2D29]/3 px-3 py-2 text-[11px] outline-none"
                style={{ borderColor: `${INK}22`, color: `${INK}CC` }}
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                onClick={onCopyLink}
                className="flex h-9 w-9 shrink-0 items-center justify-center border"
                style={{ borderColor: `${INK}22`, color: INK }}
                aria-label="Copy invite link"
              >
                {copied ? (
                  <Check size={14} className="text-[#0F8A65]" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex items-center justify-end gap-3 border-t px-6 py-4"
        style={{ borderColor: `${INK}15`, backgroundColor: "#FAFAF7" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-xs font-bold text-[#0F2D29]/55"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onInvite}
          disabled={!inviteEmail.trim() || !inviteRoleId || isInviting}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40 ${FONT_GOLDMAN}`}
          style={{ backgroundColor: INK }}
        >
          {isInviting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <UserPlus size={13} />
          )}
          {isInviting ? "Sending..." : "Send Invite"}
        </button>
      </div>
    </div>
  </div>
);
