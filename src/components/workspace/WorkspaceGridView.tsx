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
import { initials } from "./types";

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
  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-[#0F2D29]/20 bg-white p-12 text-center">
        <Building2 size={36} className="text-[#0F2D29]/40 mb-3" />
        <h3 className="text-[18px] font-bold font-['Goldman',sans-serif] text-[#0F2D29]">
          No Workspaces Found
        </h3>
        <p className="mt-1 text-[13px] text-[#5B6E68] max-w-sm">
          No workspaces match your active search query or filters. Create your
          first workspace to start managing projects.
        </p>
        <button
          onClick={onOpenCreate}
          className="mt-5 inline-flex items-center gap-2 bg-[#0F2D29] text-white px-4 py-2.5 text-[13px] font-bold font-['Goldman',sans-serif]"
        >
          Create Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {workspaces.map((ws) => {
        const isActive = ws._id === activeId;
        return (
          <div
            key={ws._id}
            onClick={() => onSelectWorkspace(ws._id)}
            className={`group relative flex flex-col justify-between border bg-white p-6 transition-all cursor-pointer ${
              isActive
                ? "border-[#0F2D29] shadow-md ring-1 ring-[#0F2D29]"
                : "border-[#0F2D29]/15 hover:border-[#0F2D29] hover:shadow-2xs"
            }`}
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div
                  className="flex h-12 w-12 items-center justify-center text-[20px] font-extrabold text-[#0F2D29] border border-[#0F2D29]/20 shadow-2xs"
                  style={{ backgroundColor: ws.color || "#8FE3C4" }}
                >
                  {ws.icon || initials(ws.name)}
                </div>

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
              </div>

              {/* Title & Description */}
              <h3 className="text-[18px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] group-hover:text-[#0F2D29] truncate">
                {ws.name}
              </h3>
              <p className="mt-2 text-[13px] font-medium text-[#5B6E68] line-clamp-2 leading-relaxed">
                {ws.description || "No description provided for this space."}
              </p>
            </div>

            {/* Footer Stats & Open CTA */}
            <div className="mt-6 pt-4 border-t border-[#0F2D29]/10 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[12px] font-semibold text-[#5B6E68]">
                <span className="flex items-center gap-1.5">
                  <Layers size={14} className="text-[#0F2D29]" />
                  {ws.projects.length} Projects
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-[#0F2D29]" />
                  {ws.members.length} Members
                </span>
              </div>

              <div className="flex items-center gap-1 text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] group-hover:translate-x-1 transition-transform">
                <span>View</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
