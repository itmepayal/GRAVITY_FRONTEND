import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import type { Workspace } from "./types";

interface DeleteWorkspaceModalProps {
  workspace: Workspace;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteWorkspaceModal = ({
  workspace,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteWorkspaceModalProps) => {
  const [confirmText, setConfirmText] = useState("");
  const isMatch = confirmText.trim() === workspace.name;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatch && !isDeleting) onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-[#8FA69E] hover:text-[#0F2D29] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="mt-4 text-[17px] font-bold text-[#0F2D29]">
          Delete "{workspace.name}"?
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#5B6E68]">
          This will permanently delete this workspace, including all projects,
          members, and activity history. This action cannot be undone.
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <label className="text-[12.5px] font-medium text-[#0F2D29]">
            Type <span className="font-bold">{workspace.name}</span> to confirm
          </label>
          <input
            autoFocus
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isDeleting}
            placeholder={workspace.name}
            className="mt-1.5 w-full rounded-xl border border-[#0F2D29]/15 px-3 py-2 text-[13px] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:opacity-50"
          />

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-xl border border-[#0F2D29]/15 px-4 py-2 text-[13px] font-medium text-[#0F2D29] hover:bg-[#0F2D29]/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isMatch || isDeleting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isDeleting && <Loader2 size={14} className="animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
