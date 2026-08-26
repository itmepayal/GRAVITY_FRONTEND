import type { ReactNode } from "react";
import { FONT_GOLDMAN, FONT_POPPINS } from "@/components/common/design-system";
import { cn } from "@/lib/utils";

type SettingsPanelProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function SettingsPanel({
  title,
  description,
  children,
  footer,
  className,
}: SettingsPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border border-[#0F2D29]/10 bg-[#F8F7F3]/40",
        className,
      )}
    >
      {(title || description) && (
        <div className="border-b border-[#0F2D29]/8 px-4 py-3 sm:px-5">
          {title && (
            <h3
              className={`text-[13px] font-bold text-[#0F2D29] ${FONT_GOLDMAN}`}
            >
              {title}
            </h3>
          )}
          {description && (
            <p className={`mt-0.5 text-[11.5px] text-[#5B6E68] ${FONT_POPPINS}`}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="flex-1 p-4 sm:p-5">{children}</div>
      {footer && (
        <div className="flex justify-end border-t border-[#0F2D29]/8 px-4 py-3 sm:px-5">
          {footer}
        </div>
      )}
    </div>
  );
}
