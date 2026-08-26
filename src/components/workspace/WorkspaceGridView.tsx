import {
  Layers,
  Users,
  Lock,
  Globe,
  Plus,
} from "lucide-react";
import type { Workspace, Role } from "./types";
import { ROLE_META, initials } from "./types";
import { AvatarStack } from "./WorkspaceListItem";
import { FONT_GOLDMAN } from "@/components/common/design-system";

export interface WorkspaceGridViewProps {
  workspaces: Workspace[];
  activeId: string | null;
  onSelectWorkspace: (id: string) => void;
  onOpenCreate: () => void;
}

export const WorkspaceGridView: React.FC<WorkspaceGridViewProps> = ({
  workspaces,
  activeId,
  onSelectWorkspace,
  onOpenCreate,
}) => {
  if (workspaces.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((ws) => {
        const isActive = ws._id === activeId;
        const normalizedRole = (ws.role || "member").toLowerCase() as Role;
        const roleMeta = ROLE_META[normalizedRole];
        const RoleIcon = roleMeta?.icon ?? Users;
        const projectProgress =
          ws.projects.length > 0
            ? Math.round(
                (ws.projects.filter((p) => p.status === "completed").length /
                  ws.projects.length) *
                  100,
              )
            : 0;

        return (
          <div
            key={ws._id}
            onClick={() => onSelectWorkspace(ws._id)}
            className={`group relative flex cursor-pointer flex-col justify-between border bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#0F2D29] hover:shadow-md ${
              isActive
                ? "border-[#0F2D29] ring-2 ring-[#0F2D29]/15"
                : "border-[#0F2D29]/15"
            }`}
          >
            <div>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center text-lg font-bold text-[#0F2D29] shadow-2xs ${FONT_GOLDMAN}`}
                  style={{ backgroundColor: ws.color || "#8FE3C4" }}
                >
                  {ws.icon || initials(ws.name)}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      ws.isPrivate
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {ws.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                    {ws.isPrivate ? "Private" : "Public"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${roleMeta?.badge ?? ""}`}
                  >
                    <RoleIcon size={10} />
                    {roleMeta?.label ?? ws.role}
                  </span>
                </div>
              </div>

              <h3
                className={`truncate text-[18px] font-bold text-[#0F2D29] ${FONT_GOLDMAN}`}
              >
                {ws.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-relaxed text-[#5B6E68]">
                {ws.description || "No description provided for this space."}
              </p>

              <div className="mt-5 space-y-1.5">
                <div
                  className={`flex items-center justify-between text-[11.5px] font-bold ${FONT_GOLDMAN}`}
                >
                  <span className="text-[#5B6E68]">Project Delivery</span>
                  <span className="text-[#0F2D29]">{projectProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden bg-[#0F2D29]/10">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${projectProgress}%`,
                      backgroundColor: ws.color || "#0F8A65",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#0F2D29]/10 pt-4">
              <div className="flex items-center gap-3 text-[12px] font-semibold text-[#5B6E68]">
                <span className="flex items-center gap-1">
                  <Layers size={14} className="text-[#0F2D29]" />
                  {ws.projects.length} Projects
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} className="text-[#0F2D29]" />
                  {ws.members.length} Members
                </span>
              </div>

              <AvatarStack
                members={ws.members.slice(0, 4)}
                extra={Math.max(0, ws.members.length - 4)}
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onOpenCreate}
        className="flex min-h-[240px] flex-col items-center justify-center border border-dashed border-[#0F2D29]/20 bg-white p-6 text-center transition hover:border-[#0F2D29]/40 hover:bg-[#0F2D29]/2"
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center bg-[#0F2D29]/8 text-[#0F2D29]">
          <Plus size={22} />
        </div>
        <p className={`text-sm font-bold text-[#0F2D29] ${FONT_GOLDMAN}`}>
          Create Workspace
        </p>
        <p className="mt-1 text-xs font-medium text-[#5B6E68]">
          Start a new organization space
        </p>
      </button>
    </div>
  );
};
