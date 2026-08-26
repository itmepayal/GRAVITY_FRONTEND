import {
  Layers,
  Users,
  Lock,
  Globe,
  ChevronRight,
} from "lucide-react";
import type { Workspace, Role } from "./types";
import { ROLE_META, initials, formatDate } from "./types";
import { FONT_GOLDMAN, FONT_POPPINS } from "@/components/common/design-system";

export interface WorkspaceTableViewProps {
  workspaces: Workspace[];
  activeId: string | null;
  onSelectWorkspace: (id: string) => void;
}

export const WorkspaceTableView: React.FC<WorkspaceTableViewProps> = ({
  workspaces,
  activeId,
  onSelectWorkspace,
}) => {
  if (workspaces.length === 0) return null;

  return (
    <div className="overflow-x-auto border border-[#0F2D29]/15 bg-white shadow-2xs">
      <table className={`w-full text-left text-xs ${FONT_POPPINS}`}>
        <thead
          className={`border-b border-[#0F2D29]/12 bg-[#0F2D29]/5 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68] ${FONT_GOLDMAN}`}
        >
          <tr>
            <th className="px-4 py-3.5">Workspace</th>
            <th className="px-4 py-3.5">Access</th>
            <th className="px-4 py-3.5">Role</th>
            <th className="px-4 py-3.5">Projects</th>
            <th className="px-4 py-3.5">Members</th>
            <th className="px-4 py-3.5">Created</th>
            <th className="px-4 py-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#0F2D29]/8 text-[#0F2D29]">
          {workspaces.map((ws) => {
            const isActive = ws._id === activeId;
            const normalizedRole = (ws.role || "member").toLowerCase() as Role;
            const roleMeta = ROLE_META[normalizedRole];
            const RoleIcon = roleMeta?.icon ?? Users;

            return (
              <tr
                key={ws._id}
                onClick={() => onSelectWorkspace(ws._id)}
                className={`group cursor-pointer transition-colors hover:bg-[#0F2D29]/3 ${
                  isActive ? "bg-[#0F8A65]/8" : ""
                }`}
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center text-sm font-bold text-[#0F2D29]"
                      style={{ backgroundColor: ws.color || "#8FE3C4" }}
                    >
                      {ws.icon || initials(ws.name)}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-bold group-hover:text-[#0F8A65] ${FONT_GOLDMAN}`}
                      >
                        {ws.name}
                      </p>
                      <p className="max-w-xs truncate text-[11px] font-medium text-[#5B6E68]">
                        {ws.description || "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-bold uppercase ${
                      ws.isPrivate
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {ws.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                    {ws.isPrivate ? "Private" : "Public"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase ${roleMeta?.badge ?? ""}`}
                  >
                    <RoleIcon size={10} />
                    {roleMeta?.label ?? ws.role}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Layers size={14} className="text-[#0F2D29]" />
                    {ws.projects.length}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Users size={14} className="text-[#0F2D29]" />
                    {ws.members.length}
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-[11px] text-[#5B6E68]">
                  {formatDate(ws.createdAt)}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWorkspace(ws._id);
                    }}
                    className={`inline-flex items-center gap-1 bg-[#0F2D29] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#081E1B] ${FONT_GOLDMAN}`}
                  >
                    Open
                    <ChevronRight size={12} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
