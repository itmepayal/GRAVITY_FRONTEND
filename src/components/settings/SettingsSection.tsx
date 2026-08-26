import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { FONT_GOLDMAN, FONT_POPPINS } from "@/components/common/design-system";
import { cn } from "@/lib/utils";

type SettingsSectionProps = {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
};

export function SettingsSection({
  id,
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-6 overflow-hidden rounded-2xl border border-[#0F2D29]/12 bg-white shadow-xs",
        className,
      )}
    >
      <header className="flex items-start gap-3 border-b border-[#0F2D29]/8 bg-gradient-to-r from-[#0F2D29]/[0.03] to-transparent px-5 py-4 sm:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#0F2D29]/10 bg-[#0F2D29]/5 text-[#0F8A65]">
          <Icon size={17} />
        </div>
        <div className="min-w-0">
          <h2
            className={`text-[16px] font-extrabold text-[#0F2D29] sm:text-[17px] ${FONT_GOLDMAN}`}
          >
            {title}
          </h2>
          <p className={`mt-0.5 text-[12px] text-[#5B6E68] ${FONT_POPPINS}`}>
            {subtitle}
          </p>
        </div>
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
