import type { ButtonHTMLAttributes } from "react";
import { FONT_GOLDMAN } from "@/components/common/design-system";
import { cn } from "@/lib/utils";

type SettingsButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type SettingsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: SettingsButtonVariant;
};

const VARIANT_CLASSES: Record<SettingsButtonVariant, string> = {
  primary:
    "bg-[#0F2D29] text-white hover:bg-[#081E1B] disabled:opacity-60",
  secondary:
    "border border-[#0F2D29]/15 bg-white text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]",
  danger:
    "bg-[#B85E2E] text-white hover:bg-[#B85E2E]/90 disabled:opacity-60",
  ghost:
    "text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]",
};

export function SettingsButton({
  variant = "primary",
  className,
  type = "button",
  ...props
}: SettingsButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[12.5px] font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed",
        FONT_GOLDMAN,
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
