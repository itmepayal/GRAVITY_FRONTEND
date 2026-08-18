import { useState, useEffect } from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { DASHBOARD_NAV } from "@/constants/dashboard";
import { GravityMark } from "@/components/common/logo";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";

type DashboardContext = {
  openMobileNav: () => void;
  currentWorkspaceId: string;
};

export const useDashboardContext = () => useOutletContext<DashboardContext>();

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspaceStore();
  const { data: workspacesResponse, isLoading: isLoadingWorkspaces } =
    useGetUserWorkspaces();

  useEffect(() => {
    if (isLoadingWorkspaces) return;

    const raw = Array.isArray(workspacesResponse)
      ? workspacesResponse
      : (workspacesResponse?.data ?? []);

    if (raw.length === 0) return;

    const isValidSelection = raw.some(
      (w: any) => (w.id ?? w._id) === currentWorkspaceId,
    );

    if (!currentWorkspaceId || !isValidSelection) {
      setCurrentWorkspaceId(raw[0].id ?? raw[0]._id);
    }
  }, [
    workspacesResponse,
    isLoadingWorkspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
  ]);

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
              {DASHBOARD_NAV.map((section) => (
                <div
                  key={section.label ?? "root"}
                  className="flex flex-col gap-1"
                >
                  {section.label && (
                    <span className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[#6E8C82]">
                      {section.label}
                    </span>
                  )}
                  {section.items.map(({ label, path, icon: Icon }) => (
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
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {isLoadingWorkspaces && !currentWorkspaceId ? (
          <div className="flex-1 flex items-center justify-center text-[#5B6E68] text-sm">
            Loading workspace...
          </div>
        ) : (
          <Outlet
            context={
              {
                openMobileNav: () => setMobileOpen(true),
                currentWorkspaceId: currentWorkspaceId ?? "",
              } satisfies DashboardContext
            }
          />
        )}
      </div>
    </div>
  );
};
