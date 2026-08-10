import React, { useState, useRef, useEffect, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { FONT_GOLDMAN, FONT_POPPINS } from "./design-system";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  entityTypeLabel?: string;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  entityTypeLabel = "Item",
  isDeleting = false,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isMatch =
    confirmText.trim().toLowerCase() === entityName.trim().toLowerCase();

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isMatch || isDeleting) return;
    onConfirm();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md transition-all animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div className="w-full max-w-md border border-[#0F2D29] bg-white shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="flex items-start justify-between gap-4 bg-red-600 p-6 text-white sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/30 bg-white/20 text-white">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className={`text-[17px] font-bold ${FONT_GOLDMAN} text-white`}>
                Delete {entityTypeLabel}
              </h2>
              <p className={`text-[12px] ${FONT_POPPINS} text-white/80`}>
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-white/80 hover:text-white transition disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 sm:p-7">
          <p className={`text-[13px] ${FONT_POPPINS} text-[#5B6E68]`}>
            To confirm deletion, please type{" "}
            <span className="font-bold text-red-600">{entityName}</span> below:
          </p>

          <div>
            <input
              ref={inputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
              placeholder={entityName}
              className={`w-full border border-[#0F2D29]/15 bg-white p-2.5 text-[13px] font-semibold text-[#0F2D29] outline-none transition focus:border-red-500 ${FONT_POPPINS}`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0F2D29]/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className={`px-4 py-2 text-[13px] font-bold text-[#5B6E68] ${FONT_POPPINS}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isMatch || isDeleting}
              className={`bg-red-600 text-white px-5 py-2 text-[13px] font-bold ${FONT_GOLDMAN} shadow-2xs hover:bg-red-700 transition disabled:opacity-40 flex items-center gap-2`}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  Delete {entityTypeLabel}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
