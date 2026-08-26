import type { LucideIcon } from "lucide-react";
import { FONT_POPPINS } from "@/components/common/design-system";
import { cn } from "@/lib/utils";

type SettingsToggleRowProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function SettingsToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingsToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#0F2D29]/10 bg-[#F8F7F3]/50 p-4 transition-colors hover:border-[#0F2D29]/18 hover:bg-white">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#0F2D29]/8 bg-white text-[#0F8A65]">
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p
            className={`text-[13px] font-semibold text-[#0F2D29] ${FONT_POPPINS}`}
          >
            {title}
          </p>
          <p className={`mt-0.5 text-[11.5px] text-[#5B6E68] ${FONT_POPPINS}`}>
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE3C4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-[#0F2D29]" : "bg-[#0F2D29]/15",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
