import React from "react";
import { FolderKanban, Plus, Layers, Users, ExternalLink } from "lucide-react";
import { type Project, STATUS_META, initials } from "./types";

export interface ProjectTableViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenCreate: () => void;
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({
  projects,
  onSelectProject,
  onOpenCreate,
}) => {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-[#0F2D29]/20 bg-white py-16 px-6 text-center shadow-2xs">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-[#0F2D29]/10 text-[#0F2D29]">
          <FolderKanban size={26} />
        </div>
        <h3 className="text-[17px] font-bold font-['Goldman',sans-serif] text-[#0F2D29]">
          No Projects Found
        </h3>
        <p className="mt-1.5 max-w-sm text-[13px] font-medium text-[#5B6E68]">
          No projects match your active search and filter criteria.
        </p>
        <button
          onClick={onOpenCreate}
          className="mt-5 inline-flex items-center gap-2 bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif] text-white shadow-2xs hover:bg-[#081E1B] transition"
        >
          <Plus size={15} strokeWidth={2.5} />
          Create New Project
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#0F2D29]/15 bg-white shadow-2xs">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-[#0F2D29]/10 bg-[#0F2D29]/5 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68] font-['Goldman',sans-serif]">
          <tr>
            <th className="py-3.5 px-4">Project</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Progress</th>
            <th className="py-3.5 px-4">Tasks</th>
            <th className="py-3.5 px-4">Members</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#0F2D29]/8">
          {projects.map((proj) => {
            const meta = STATUS_META[proj.status] || STATUS_META.planning;
            const StatusIcon = meta.icon;

            return (
              <tr
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className="group hover:bg-[#0F2D29]/4 transition-colors cursor-pointer"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center font-bold text-white shadow-2xs font-['Goldman',sans-serif] text-[12px]"
                      style={{ backgroundColor: proj.color || "#0F2D29" }}
                    >
                      {initials(proj.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#0F2D29] font-['Goldman',sans-serif] truncate text-[14px]">
                        {proj.name}
                      </p>
                      <p className="text-[11.5px] font-medium text-[#5B6E68] truncate max-w-xs">
                        {proj.description || "No description"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className="inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider font-['Goldman',sans-serif]"
                    style={{
                      color: meta.color,
                      backgroundColor: meta.bg,
                      borderColor: meta.border,
                    }}
                  >
                    <StatusIcon size={12} />
                    {meta.label}
                  </span>
                </td>
                <td className="py-3.5 px-4 min-w-36">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold font-['Goldman',sans-serif]">
                      <span className="text-[#0F2D29]">{proj.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden bg-[#0F2D29]/10">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${proj.progress}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-bold text-[#0F2D29] font-['Goldman',sans-serif]">
                  <div className="flex items-center gap-1.5">
                    <Layers size={14} className="text-[#0F2D29]" />
                    {proj.tasksCount}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-bold text-[#0F2D29]">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-[#0F2D29]" />
                    {proj.members.length}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(proj);
                    }}
                    className="inline-flex items-center gap-1 bg-[#0F2D29]/5 px-3 py-1.5 text-[11.5px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] hover:bg-[#0F2D29] hover:text-white transition"
                  >
                    Details <ExternalLink size={12} />
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
