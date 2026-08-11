import { NavLink } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react";
import { DASHBOARD_NAV } from "@/constants/dashboard";
import { GravityMark } from "@/components/common/logo";
import { useCurrentUser } from "@/hooks/mutations/settings/use-current-user";
import { useLogout } from "@/hooks/mutations/auth/use-logout";

export const Sidebar = () => {
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  const initials =
    user?.name
      ?.split(" ")
      .map((p: string) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  const avatar = (user as any)?.avatar as string | undefined;

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 bg-[#0F2D29] border-r border-white/10 select-none">
      {/* Sidebar Header: Brand Logo & Title */}
      <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-white/10 bg-[#081E1B]">
        <div className="flex items-center gap-3">
          <GravityMark size={32} className="shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-white text-[18px] font-bold font-['Goldman',sans-serif] tracking-wide leading-tight">
                Gravity
              </span>
              <span className="bg-[#8FE3C4]/15 text-[#8FE3C4] border border-[#8FE3C4]/30 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest">
                TMS
              </span>
            </div>
            <span className="text-[10.5px] font-medium text-[#8FA69E]">
              Task Management Suite
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav-scroll flex-1 flex flex-col gap-4 px-3 py-3 overflow-y-auto">
        {DASHBOARD_NAV.map((section, sIdx) => (
          <div
            key={section.label ?? `section-${sIdx}`}
            className="flex flex-col gap-1"
          >
            {section.label && (
              <p className="px-3 pt-1.5 pb-1 text-[11px] font-bold font-['Goldman',sans-serif] tracking-widest uppercase text-[#6F8A82]">
                {section.label}
              </p>
            )}
            {section.items.map(({ label, path, icon: Icon, badge }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/dashboard"}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center justify-between px-3.5 py-2.5 text-[14px] font-medium leading-snug transition-all duration-150",
                    "focus-visible:outline-none",
                    isActive
                      ? "bg-white/12 text-white font-bold border-l-2 border-l-[#8FE3C4]"
                      : "text-[#B7CFC7] hover:text-white hover:bg-white/6",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={17}
                        strokeWidth={2}
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? "text-[#8FE3C4]"
                            : "text-[#8FA69E] group-hover:text-white"
                        }`}
                      />
                      <span className="truncate font-['Goldman',sans-serif]">
                        {label}
                      </span>
                    </div>
                    {badge && (
                      <span className="shrink-0 bg-[#8FE3C4] text-[#0F2D29] font-bold font-['Goldman',sans-serif] text-[9.5px] uppercase tracking-wider px-1.5 py-0.5">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-white/10 bg-[#081E1B]">
        <div className="flex items-center gap-2.5 px-2 py-2 transition-colors">
          {avatar ? (
            <img
              src={avatar}
              alt={user?.name ? `${user.name}'s avatar` : "User avatar"}
              className="w-8 h-8 object-cover shrink-0 ring-1 ring-white/20"
            />
          ) : (
            <div
              className="w-8 h-8 flex items-center justify-center text-[11px] font-bold text-[#0F2D29] shrink-0 ring-1 ring-white/20"
              style={{ backgroundColor: "#8FE3C4" }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-white text-[13px] font-bold font-['Goldman',sans-serif] truncate leading-tight">
              {user?.name ?? "Developer"}
            </p>
            <p className="text-[#8FA69E] text-[11px] truncate">
              {user?.email ?? "dev@gravity.tms"}
            </p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            aria-label="Log out"
            title="Log out"
            className="w-8 h-8 shrink-0 flex items-center justify-center text-[#B7CFC7] hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {logoutMutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <LogOut size={15} />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
