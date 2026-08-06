import { FolderKanban, X } from "lucide-react";
import { type Project, PROJECT_STATUS_META } from "./types";

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetailModal = ({
  project,
  onClose,
}: ProjectDetailModalProps) => {
  const StatusIcon = PROJECT_STATUS_META[project.status].icon;
  const pct =
    project.taskCount > 0
      ? Math.round((project.completedTaskCount / project.taskCount) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#0F2D29]/10 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#0F2D29]/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8FE3C4]/20 text-[#0F8A65]">
              <FolderKanban size={22} />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#0F2D29]">
                {project.name}
              </h3>
              <span
                className={`mt-0.5 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-semibold border ${PROJECT_STATUS_META[project.status].badge
                  }`}
              >
                <StatusIcon size={11} />
                {PROJECT_STATUS_META[project.status].label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8FA69E] hover:text-[#0F2D29]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-5 space-y-4">
          <div>
            <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-[#8FA69E]">
              Description
            </h4>
            <p className="mt-1 text-[13.5px] leading-relaxed text-[#5B6E68]">
              {project.description || "No project overview provided."}
            </p>
          </div>

          <div className="rounded-xl border border-[#0F2D29]/8 bg-[#0F2D29]/2 p-4">
            <div className="flex items-center justify-between text-[12.5px] font-bold text-[#0F2D29]">
              <span>Task Completion Rate</span>
              <span>{pct}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#0F2D29]/10">
              <div
                className="h-full bg-[#0F8A65] transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-[11.5px] text-[#8FA69E]">
              {project.completedTaskCount} of {project.taskCount} tasks marked completed.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-[#0F2D29]/8 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#0F2D29] px-5 py-2 text-[13px] font-medium text-white shadow-xs"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
