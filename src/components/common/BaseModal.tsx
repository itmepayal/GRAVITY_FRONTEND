import React, { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, type LucideIcon } from "lucide-react";
import { FONT_GOLDMAN, FONT_POPPINS } from "./design-system";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  maxWidthCls?: string;
  children: ReactNode;
  footer?: ReactNode;
  isSubmitting?: boolean;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  maxWidthCls = "max-w-md",
  children,
  footer,
  isSubmitting = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md transition-all animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className={`w-full ${maxWidthCls} border border-[#0F2D29] bg-white shadow-2xl overflow-hidden`}>
        {/* Header Banner */}
        <div className="flex items-start justify-between gap-4 bg-[#0F2D29] p-6 text-white sm:p-7">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#8FE3C4]/30 bg-[#8FE3C4]/20 text-[#8FE3C4]">
                <Icon size={20} />
              </div>
            )}
            <div>
              <h2 className={`text-[17px] font-bold ${FONT_GOLDMAN} text-white`}>
                {title}
              </h2>
              {subtitle && (
                <p className={`text-[12px] ${FONT_POPPINS} text-[#B7CFC7]`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[#B7CFC7] hover:text-white transition disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7">{children}</div>

        {/* Optional Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[#0F2D29]/10 bg-[#0F2D29]/3 px-6 py-4 sm:px-7">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
