import { Search, Bell, Menu } from "lucide-react";

type TopbarProps = {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
};

export const Topbar = ({ title, subtitle, onMenuClick }: TopbarProps) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 h-16 px-4 sm:px-6 lg:px-8 bg-[#F8F7F3]/90 backdrop-blur-sm border-b border-[#0F2D29]/8">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#0F2D29] hover:bg-[#0F2D29]/5"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[#0F2D29] text-[17px] sm:text-[19px] font-bold tracking-[-0.01em] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[#5B6E68] text-[12px] truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="hidden sm:flex items-center flex-1 max-w-[320px] relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
        />
        <input
          type="text"
          placeholder="Search tasks, people…"
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#0F2D29]/4 border border-[#0F2D29]/8 text-[13px] text-[#0F2D29] placeholder:text-[#8FA69E] focus:outline-none focus:ring-2 focus:ring-[#8FE3C4] focus:border-transparent transition"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#0F2D29]/70 hover:bg-[#0F2D29]/5 hover:text-[#0F2D29] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#E98A57]" />
        </button>
      </div>
    </header>
  );
};
