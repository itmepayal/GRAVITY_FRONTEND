import type { ReactNode } from "react";

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
    tone === "danger" ? "border-[#E98A57]/25" : "border-[#0F2D29]/8";
  const headerBorder =
    tone === "danger" ? "border-[#E98A57]/15" : "border-[#0F2D29]/6";

  return (
    <section
      className={`h-full flex flex-col bg-white rounded-xl border ${border} overflow-hidden shadow-[0_1px_2px_rgba(15,45,41,0.04)] ${className}`}
    >
      <div className={`px-5 sm:px-6 py-4 border-b ${headerBorder}`}>
        <h2 className="text-[#0F2D29] text-[14.5px] font-semibold tracking-[-0.01em]">
          {title}
        </h2>
        {description && (
          <p className="text-[#5B6E68] text-[12px] mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-5 sm:p-6 flex-1">{children}</div>
      {footer && (
        <div className="flex justify-end px-5 sm:px-6 py-4 border-t border-[#0F2D29]/6 bg-[#0F2D29]/1.5">
          {footer}
        </div>
      )}
    </section>
  );
};
