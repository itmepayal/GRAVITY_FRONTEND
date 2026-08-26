import type { LucideIcon } from "lucide-react";
import { Bell, Building2, Shield, User } from "lucide-react";
import { FONT_POPPINS } from "@/components/common/design-system";
import { cn } from "@/lib/utils";

const SECTIONS: Array<{
  id: string;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "workspace", label: "Workspace", icon: Building2 },
];

export function SettingsQuickNav() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Settings sections"
      className="flex flex-wrap gap-2 rounded-2xl border border-[#0F2D29]/10 bg-white p-2 shadow-xs"
    >
      {SECTIONS.map((section) => {
        const Icon = section.icon;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-[12px] font-semibold text-[#5B6E68] transition-colors hover:border-[#0F2D29]/10 hover:bg-[#F8F7F3] hover:text-[#0F2D29]",
              FONT_POPPINS,
            )}
          >
            <Icon size={14} className="text-[#0F8A65]" />
            {section.label}
          </button>
        );
      })}
    </nav>
  );
}
