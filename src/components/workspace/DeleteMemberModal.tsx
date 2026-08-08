import { useState } from "react";
import { AlertTriangle, Loader2, X, UserMinus } from "lucide-react";

interface DeleteMemberModalProps {
  memberName: string;
  memberEmail: string;
  isRemoving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteMemberModal = ({
  memberName,
  memberEmail,
  isRemoving,
  onClose,
  onConfirm,
}: DeleteMemberModalProps) => {
  const [confirmText, setConfirmText] = useState("");
  const isMatch =
    confirmText.trim().toLowerCase() === memberEmail.toLowerCase();

  const handleSubmit = () => {
    if (!isMatch || isRemoving) return;
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/45 p-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={isRemoving ? undefined : onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-member-title"
        className="w-full max-w-md rounded-2xl border border-[#0F2D29]/10 bg-white p-6 shadow-2xl shadow-[#0F2D29]/20 animate-[modalIn_0.18s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#0F2D29]/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3
                id="delete-member-title"
                className="text-[16px] font-bold text-[#0F2D29]"
              >
                Remove Teammate
              </h3>
              <p className="text-[12px] text-[#8FA69E]">
                This action cannot be undone.
              </p>
            </div>
          </div>
          {!isRemoving && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-lg p-1 text-[#8FA69E] transition-colors hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="my-5">
          <p className="text-[13.5px] leading-relaxed text-[#5B6E68]">
            This will remove{" "}
            <span className="font-semibold text-[#0F2D29]">{memberName}</span>{" "}
            from this workspace. They'll lose access to all projects and tasks
            here. Type their email below to confirm.
          </p>

          <input
            autoFocus
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            disabled={isRemoving}
            placeholder={memberEmail}
            className="mt-3.5 w-full rounded-xl border border-[#0F2D29]/10 bg-white px-3.5 py-2.5 text-[13px] text-[#0F2D29] outline-none placeholder:text-[#8FA69E]/60 focus:border-red-300 focus:ring-2 focus:ring-red-200/60 disabled:opacity-50"
          />
          {confirmText.length > 0 && !isMatch && (
            <p className="mt-1.5 text-[11.5px] font-medium text-red-500">
              Email doesn't match. Type "{memberEmail}" exactly.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-[#0F2D29]/8 pt-4">
          <button
            onClick={onClose}
            disabled={isRemoving}
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-[#5B6E68] disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isMatch || isRemoving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-[13px] font-medium text-white shadow-xs transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            {isRemoving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <UserMinus size={14} />
                Remove Member
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
