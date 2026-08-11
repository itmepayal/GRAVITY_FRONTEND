import React from "react";
import {
  Building2,
  Layers,
  Users,
  Lock,
  Globe,
  ArrowRight,
} from "lucide-react";
import type { Workspace } from "./types";
import { initials, formatDate } from "./types";

export interface WorkspaceTableViewProps {
  workspaces: Workspace[];
  activeId: string | null;
  onSelectWorkspace: (id: string) => void;
  onOpenCreate: () => void;
}

export const WorkspaceTableView: React.FC<WorkspaceTableViewProps> = ({
  workspaces,
  activeId,
  onSelectWorkspace,
  onOpenCreate,
}) => {
  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-[#0F2D29]/20 bg-white p-12 text-center">
        <Building2 size={36} className="text-[#0F2D29]/40 mb-3" />
        <h3 className="text-[18px] font-bold font-['Goldman',sans-serif] text-[#0F2D29]">
          No Workspaces Found
        </h3>
        <p className="mt-1 text-[13px] text-[#5B6E68]">
          No workspaces match your active filter or search terms.
        </p>
        <button
          onClick={onOpenCreate}
          className="mt-5 inline-flex items-center gap-2 bg-[#0F2D29] text-white px-4 py-2 text-[13px] font-bold font-['Goldman',sans-serif]"
        >
          Create Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#0F2D29]/12 bg-white shadow-2xs">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-[#0F2D29]/5 border-b border-[#0F2D29]/10 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">
          <tr>
            <th className="py-3.5 px-4 font-['Goldman',sans-serif]">
              Workspace Name
            </th>
            <th className="py-3.5 px-4 font-['Goldman',sans-serif]">
              Access & Role
            </th>
            <th className="py-3.5 px-4 font-['Goldman',sans-serif]">
              Projects
            </th>
            <th className="py-3.5 px-4 font-['Goldman',sans-serif]">Members</th>
            <th className="py-3.5 px-4 font-['Goldman',sans-serif]">
              Created Date
            </th>
            <th className="py-3.5 px-4 text-right font-['Goldman',sans-serif]">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#0F2D29]/8">
          {workspaces.map((ws) => {
            const isActive = ws._id === activeId;
            return (
              <tr
                key={ws._id}
                onClick={() => onSelectWorkspace(ws._id)}
                className={`transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#0F2D29]/8 font-semibold"
                    : "hover:bg-[#0F2D29]/4"
                }`}
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center text-[15px] font-extrabold text-[#0F2D29] border border-[#0F2D29]/20"
                      style={{ backgroundColor: ws.color || "#8FE3C4" }}
                    >
                      {ws.icon || initials(ws.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#0F2D29] font-['Goldman',sans-serif] truncate">
                        {ws.name}
                      </p>
                      <p className="text-[11.5px] text-[#5B6E68] truncate max-w-xs">
                        {ws.description || "No description"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10.5px] font-bold ${
                        ws.isPrivate
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-emerald-300 bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {ws.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                      {ws.isPrivate ? "Private" : "Public"}
                    </span>
                    <span className="border border-[#0F2D29]/15 bg-[#0F2D29]/5 px-2 py-0.5 text-[10.5px] font-bold uppercase text-[#0F2D29]">
                      {ws.role}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#0F2D29]">
                  <div className="flex items-center gap-1.5">
                    <Layers size={14} className="text-[#0F2D29]" />
                    {ws.projects.length}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#0F2D29]">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-[#0F2D29]" />
                    {ws.members.length}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-[12px] font-medium text-[#5B6E68]">
                  {formatDate(ws.createdAt)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWorkspace(ws._id);
                    }}
                    className="inline-flex items-center gap-1 bg-[#0F2D29] text-white px-3 py-1.5 text-[11.5px] font-bold font-['Goldman',sans-serif] hover:bg-[#081E1B] transition"
                  >
                    Details
                    <ArrowRight size={12} />
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
