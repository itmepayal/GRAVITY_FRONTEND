import { useState } from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { DASHBOARD_NAV } from "@/constants/dashboard";
import { GravityMark } from "@/components/common/logo";

type DashboardContext = {
  openMobileNav: () => void;
};

export const useDashboardContext = () => useOutletContext<DashboardContext>();

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F7F3]">
      <Sidebar />

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-65 bg-[#0F2D29] flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 shrink-0">
              <div className="flex items-center gap-2.5">
                <GravityMark className="w-6 h-6" />
                <span className="text-white text-[16px] font-semibold">
                  Gravity
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-white/80 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1 px-3">
              {DASHBOARD_NAV.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors",
                      isActive
                        ? "bg-white/8 text-white"
                        : "text-[#B7CFC7] hover:text-white hover:bg-white/5",
                    ].join(" ")
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Outlet
          context={
            {
              openMobileNav: () => setMobileOpen(true),
            } satisfies DashboardContext
          }
        />
      </div>
    </div>
  );
};
