import { Search, Bell, Menu } from "lucide-react";

type TopbarProps = {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  variant?: "light" | "dark";
};

export const Topbar = ({
  title,
  subtitle,
  onMenuClick,
  variant = "light",
}: TopbarProps) => {
  const isDark = variant === "dark";

  return (
    <header
      className={`sticky top-0 z-10 flex h-16 items-center justify-between gap-4 px-4 backdrop-blur-sm sm:px-6 lg:px-8 ${
        isDark
          ? "border-b border-white/8 bg-[#0F2D29]/95"
          : "border-b border-[#0F2D29]/8 bg-[#F8F7F3]/90"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className={`flex h-9 w-9 items-center justify-center rounded-lg md:hidden ${
            isDark
              ? "text-white hover:bg-white/5"
              : "text-[#0F2D29] hover:bg-[#0F2D29]/5"
          }`}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1
            className={`truncate text-[17px] font-bold tracking-[-0.01em] sm:text-[19px] ${
              isDark ? "text-white" : "text-[#0F2D29]"
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`truncate text-[12px] ${
                isDark ? "text-[#B7CFC7]" : "text-[#5B6E68]"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="relative hidden max-w-[320px] flex-1 items-center sm:flex">
        <Search
          size={15}
          className={`absolute top-1/2 left-3 -translate-y-1/2 ${
            isDark ? "text-[#5C766E]" : "text-[#8FA69E]"
          }`}
        />
        <input
          type="text"
          placeholder="Search tasks, people…"
          className={`h-9 w-full rounded-lg border pr-3 pl-9 text-[13px] transition focus:border-transparent focus:ring-2 focus:ring-[#8FE3C4] focus:outline-none ${
            isDark
              ? "border-white/8 bg-white/5 text-white placeholder:text-[#5C766E]"
              : "border-[#0F2D29]/8 bg-[#0F2D29]/4 text-[#0F2D29] placeholder:text-[#8FA69E]"
          }`}
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
            isDark
              ? "text-[#B7CFC7] hover:bg-white/5 hover:text-white"
              : "text-[#0F2D29]/70 hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
          }`}
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#E98A57]" />
        </button>
      </div>
    </header>
  );
};
