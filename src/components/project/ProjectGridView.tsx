import React from "react";
import { FolderKanban, Plus, Layers, Users } from "lucide-react";
import { type Project, STATUS_META, initials } from "./types";

export interface ProjectGridViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenCreate: () => void;
}

export const ProjectGridView: React.FC<ProjectGridViewProps> = ({
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((proj) => {
        const meta = STATUS_META[proj.status] || STATUS_META.planning;
        const StatusIcon = meta.icon;

        return (
          <div
            key={proj.id}
            onClick={() => onSelectProject(proj)}
            className="group relative flex flex-col justify-between border border-[#0F2D29]/15 bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#0F2D29] hover:shadow-md cursor-pointer"
          >
            <div>
              {/* Header Badge & Color */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center font-bold text-white shadow-2xs font-['Goldman',sans-serif] text-[13px]"
                    style={{ backgroundColor: proj.color || "#0F2D29" }}
                  >
                    {initials(proj.name)}
                  </div>
                  <span className="text-[12px] font-bold text-[#5B6E68] truncate">
                    {proj.workspaceName || "Workspace"}
                  </span>
                </div>

                <span
                  className="inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider font-['Goldman',sans-serif]"
                  style={{
                    color: meta.color,
                    backgroundColor: meta.bg,
                    borderColor: meta.border,
                  }}
                >
                  <StatusIcon size={12} />
                  {meta.label}
                </span>
              </div>

              {/* Project Title & Description */}
              <h3 className="text-[18px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] group-hover:text-[#0F2D29] truncate">
                {proj.name}
              </h3>
              <p className="mt-2 text-[13px] font-medium text-[#5B6E68] line-clamp-2 leading-relaxed">
                {proj.description ||
                  "No description provided for this project."}
              </p>

              {/* Progress Bar */}
              <div className="mt-5 space-y-1.5">
                <div className="flex items-center justify-between text-[11.5px] font-bold font-['Goldman',sans-serif]">
                  <span className="text-[#5B6E68]">Delivery Progress</span>
                  <span className="text-[#0F2D29]">{proj.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden bg-[#0F2D29]/10">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${proj.progress}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer Stats & Teammates */}
            <div className="mt-6 pt-4 border-t border-[#0F2D29]/10 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[12px] font-semibold text-[#5B6E68]">
                <span className="flex items-center gap-1">
                  <Layers size={14} className="text-[#0F2D29]" />
                  {proj.tasksCount} Tasks
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} className="text-[#0F2D29]" />
                  {proj.members.length}
                </span>
              </div>

              {/* Teammate Avatars */}
              <div className="flex items-center -space-x-1.5 shrink-0">
                {proj.members.slice(0, 3).map((m, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border border-white bg-[#8FE3C4] text-[#0F2D29] flex items-center justify-center text-[9px] font-bold font-['Goldman',sans-serif] overflow-hidden shrink-0"
                  >
                    {m.user.avatar ? (
                      <img
                        src={m.user.avatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(m.user.name || "U")
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
