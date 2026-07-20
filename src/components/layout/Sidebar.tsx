import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
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
      <div className="flex items-center gap-2.5 px-6 h-16 shrink-0">
        <GravityMark className="w-6 h-6 shrink-0" />
        <span className="text-white text-[17px] font-semibold tracking-[-0.01em]">
          Gravity
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 mt-2">
        {DASHBOARD_NAV.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/dashboard"}
            className={({ isActive }) =>
              [
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors",
                isActive
                  ? "bg-white/8 text-white"
                  : "text-[#B7CFC7] hover:text-white hover:bg-white/5",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.75 rounded-full bg-[#8FE3C4] transition-opacity ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
                <Icon size={17} strokeWidth={2} className="shrink-0" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          {avatar ? (
            <img
              src={avatar}
              alt={user?.name ?? "User"}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-[#0F2D29] shrink-0"
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
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md text-[#B7CFC7] hover:text-white hover:bg-white/8 transition-colors focus-visible:outline focus-visible:outline-[#8FE3C4] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
