import type { ReactNode } from "react";
import { FONT_GOLDMAN, FONT_POPPINS } from "@/components/common/design-system";

interface SettingsCardProps {
  title: string;
  description?: string;
  tone?: "default" | "danger";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const SettingsCard = ({
  title,
  description,
  tone = "default",
  children,
  footer,
  className = "",
}: SettingsCardProps) => {
  const border =
    tone === "danger" ? "border-[#E98A57]/25" : "border-[#0F2D29]/12";
  const headerBorder =
    tone === "danger" ? "border-[#E98A57]/15" : "border-[#0F2D29]/8";

  return (
    <section
      className={`h-full flex flex-col rounded-2xl border ${border} bg-white overflow-hidden shadow-xs transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className={`px-5 sm:px-6 py-4 border-b ${headerBorder} bg-gradient-to-r from-[#0F2D29]/[0.02] to-transparent`}>
        <h2 className={`text-[#0F2D29] text-[15px] font-bold tracking-tight ${FONT_GOLDMAN}`}>
          {title}
        </h2>
        {description && (
          <p className={`text-[#5B6E68] text-[12px] mt-1 leading-relaxed ${FONT_POPPINS}`}>
            {description}
          </p>
        )}
      </div>
      <div className="p-5 sm:p-6 flex-1">{children}</div>
      {footer && (
        <div className="flex justify-end px-5 sm:px-6 py-4 border-t border-[#0F2D29]/8 bg-[#F8F7F3]/60">
          {footer}
        </div>
      )}
    </section>
  );
};
