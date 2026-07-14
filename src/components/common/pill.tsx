import { ArrowRight } from "lucide-react";

type PillProps = {
  children: React.ReactNode;
  variant?: "solid" | "outline";
  dark?: boolean;
  icon?: boolean;
  href?: string;
  onClick?: () => void;
};

export const Pill = ({
  children,
  variant = "solid",
  dark = false,
  icon = false,
  href = "#pricing",
  onClick,
}: PillProps) => {
  const base =
    "inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[13.5px] font-semibold transition-all duration-150 cursor-pointer";

  if (variant === "solid") {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`${base} bg-[#8FE3C4] text-[#0F2D29] hover:bg-[#7BD6B4] hover:shadow-[0_8px_20px_rgba(143,227,196,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FE3C4]`}
      >
        {children}
        {icon && <ArrowRight size={15} strokeWidth={2.5} />}
      </a>
    );
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className={`${base} border ${
        dark
          ? "border-white/20 text-white hover:bg-white/10"
          : "border-[#0F2D29]/20 text-[#0F2D29] hover:bg-[#0F2D29]/5"
      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FE3C4]`}
    >
      {children}
    </a>
  );
};