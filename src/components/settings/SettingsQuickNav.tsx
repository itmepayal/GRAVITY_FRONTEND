import { useEffect, useState } from "react";
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
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    for (const section of SECTIONS) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Settings sections"
      className="w-full rounded-2xl border border-[#0F2D29]/10 bg-white p-2 shadow-xs lg:p-2.5"
    >
      <p
        className={`mb-2 hidden px-2 text-[10px] font-bold uppercase tracking-wider text-[#8FA69E] lg:block ${FONT_POPPINS}`}
      >
        Jump to
      </p>
      <div className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-1">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeId === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors lg:w-full",
                FONT_POPPINS,
                isActive
                  ? "border-[#0F2D29]/12 bg-[#0F2D29] text-white shadow-sm"
                  : "border-transparent text-[#5B6E68] hover:border-[#0F2D29]/10 hover:bg-[#F8F7F3] hover:text-[#0F2D29]",
              )}
            >
              <Icon
                size={14}
                className={isActive ? "text-[#8FE3C4]" : "text-[#0F8A65]"}
              />
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
