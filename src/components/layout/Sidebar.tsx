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
    <aside className="hidden md:flex md:flex-col w-62 shrink-0 h-screen sticky top-0 bg-[#0F2D29] border-r border-white/8">
      <div className="flex items-center gap-2.5 px-6 h-16 shrink-0 border-b border-white/8">
        <GravityMark className="w-6 h-6 shrink-0" />
        <span className="text-white text-[17px] font-semibold tracking-[-0.01em]">
          Gravity
        </span>
      </div>

      <nav className="sidebar-nav-scroll flex-1 flex flex-col gap-4 px-3 py-3 overflow-y-auto">
        {DASHBOARD_NAV.map((section, sIdx) => (
          <div
            key={section.label ?? `section-${sIdx}`}
            className="flex flex-col gap-1"
          >
            {section.label && (
              <p className="px-3 pb-1 text-[10.5px] font-semibold tracking-[0.08em] uppercase text-[#5C766E]">
                {section.label}
              </p>
            )}
            {section.items.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/dashboard"}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FE3C4]",
                    isActive
                      ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                      : "text-[#B7CFC7] hover:text-white hover:bg-white/5",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 h-4.5 w-1 rounded-full bg-[#8FE3C4] transition-all duration-200 ${
                        isActive
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-50"
                      }`}
                    />
                    <Icon
                      size={17}
                      strokeWidth={2}
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? "text-[#8FE3C4]"
                          : "text-[#B7CFC7] group-hover:text-white"
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
          {avatar ? (
            <img
              src={avatar}
              alt={user?.name ? `${user.name}'s avatar` : "User avatar"}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/15"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-[#0F2D29] shrink-0 ring-1 ring-white/15"
              style={{ backgroundColor: "#8FE3C4" }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-white text-[13px] font-medium truncate">
              {user?.name ?? "Guest"}
            </p>
            <p className="text-[#8FA69E] text-[11.5px] truncate">
              {user?.email ?? ""}
            </p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            aria-label="Log out"
            title="Log out"
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md text-[#B7CFC7] hover:text-white hover:bg-white/8 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FE3C4] disabled:opacity-50 disabled:cursor-not-allowed"
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
