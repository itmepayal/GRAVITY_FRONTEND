import type { FC } from "react";
import { Mail, X } from "lucide-react";

interface WorkspacePendingInvitesBannerProps {
  invitations: any[];
  onDismiss: () => void;
  onAccept?: (inviteId: string) => void;
  onDecline?: (inviteId: string) => void;
}

export const WorkspacePendingInvitesBanner: FC<
  WorkspacePendingInvitesBannerProps
> = ({ invitations, onDismiss, onAccept, onDecline }) => {
  if (invitations.length === 0) return null;

  return (
    <div className="flex items-start gap-3 border border-[#0F8A65]/30 bg-[#E7F5EF] p-4 sm:p-5">
      <Mail size={18} className="mt-0.5 shrink-0 text-[#0F8A65]" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#0F2D29]">
          You have {invitations.length} pending workspace invitation
          {invitations.length === 1 ? "" : "s"}
        </p>
        <ul className="mt-2 space-y-1.5">
          {invitations.map((invite: any) => (
            <li
              key={invite._id}
              className="flex flex-wrap items-center gap-2 text-xs text-[#0F2D29]/80"
            >
              <span>
                <span className="font-semibold">
                  {invite.workspaceName ??
                    invite.workspace?.name ??
                    "A workspace"}
                </span>
                {invite.invitedBy && <> · invited by {invite.invitedBy}</>}
              </span>
              <button
                type="button"
                className="border border-[#0F8A65] px-2 py-0.5 text-[11px] font-bold text-[#0F8A65] hover:bg-[#0F8A65] hover:text-white"
                onClick={() => onAccept?.(invite._id)}
              >
                Accept
              </button>
              <button
                type="button"
                className="border border-[#0F2D29]/20 px-2 py-0.5 text-[11px] font-bold text-[#0F2D29]/70 hover:bg-[#0F2D29]/5"
                onClick={() => onDecline?.(invite._id)}
              >
                Decline
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        className="shrink-0 text-[#0F2D29]/40 hover:text-[#0F2D29]"
        onClick={onDismiss}
      >
        <X size={16} />
      </button>
    </div>
  );
};
