import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Pencil,
  Trash2,
  Users,
  Layers,
  Calendar,
  UserPlus,
  Rocket,
  Zap,
} from "lucide-react";
import { type Project, type ProjectStatus, STATUS_META, initials } from "./types";

export interface ProjectDetailDrawerProps {
  project: Project;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onUpdateStatus: (projectId: string, status: ProjectStatus) => void;
}

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  project,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "members">("overview");
  const meta = STATUS_META[project.status] || STATUS_META.planning;
  const StatusIcon = meta.icon;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0F2D29]/50 backdrop-blur-md transition-all">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-[#0F2D29] bg-white shadow-2xl z-10">
        {/* Top Header Banner */}
        <div className="flex items-start justify-between bg-[#0F2D29] p-6 text-white sm:p-7">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center font-bold text-white shadow-2xs font-['Goldman',sans-serif] text-[15px]"
              style={{ backgroundColor: project.color || "#0F2D29" }}
            >
              {initials(project.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-[18px] font-bold font-['Goldman',sans-serif] text-white truncate">
                {project.name}
              </h2>
              <p className="text-[12px] font-semibold text-[#B7CFC7]">
                {project.workspaceName || "Workspace Project"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#B7CFC7] hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between border-b border-[#0F2D29]/10 bg-[#0F2D29]/4 px-6 py-3">
          <div className="flex items-center gap-2">
            <select
              value={project.status}
              onChange={(e) => onUpdateStatus(project.id, e.target.value as ProjectStatus)}
              className="border border-[#0F2D29]/20 bg-white px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] outline-none cursor-pointer uppercase"
            >
              {(Object.keys(STATUS_META) as ProjectStatus[]).map((st) => (
                <option key={st} value={st}>
                  {STATUS_META[st].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(project)}
              className="flex items-center gap-1.5 border border-[#0F2D29]/20 bg-white px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] hover:bg-[#0F2D29] hover:text-white transition"
            >
              <Pencil size={13} />
              Edit
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="flex items-center gap-1.5 border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] text-red-600 hover:bg-red-600 hover:text-white transition"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#0F2D29]/10 bg-white px-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 py-3 px-4 text-[13px] font-bold font-['Goldman',sans-serif] transition ${
              activeTab === "overview"
                ? "border-[#0F2D29] text-[#0F2D29]"
                : "border-transparent text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`border-b-2 py-3 px-4 text-[13px] font-bold font-['Goldman',sans-serif] transition ${
              activeTab === "members"
                ? "border-[#0F2D29] text-[#0F2D29]"
                : "border-transparent text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
          >
            Teammates ({project.members.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" ? (
            <>
              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-[12px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] uppercase tracking-wider">
                  Description
                </h4>
                <p className="text-[13px] font-medium leading-relaxed text-[#5B6E68] bg-[#0F2D29]/3 border border-[#0F2D29]/10 p-4">
                  {project.description || "No description provided for this project."}
                </p>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px] font-bold font-['Goldman',sans-serif]">
                  <span className="text-[#0F2D29] uppercase">Delivery Completion</span>
                  <span className="text-[#0F2D29]">{project.progress}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden bg-[#0F2D29]/10 border border-[#0F2D29]/15">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#0F2D29]/15 p-4 bg-white">
                  <p className="text-[11px] font-bold font-['Goldman',sans-serif] text-[#5B6E68] uppercase">
                    Total Tasks
                  </p>
                  <p className="mt-1 text-[20px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] flex items-center gap-2">
                    <Layers size={18} />
                    {project.tasksCount}
                  </p>
                </div>
                <div className="border border-[#0F2D29]/15 p-4 bg-white">
                  <p className="text-[11px] font-bold font-['Goldman',sans-serif] text-[#5B6E68] uppercase">
                    Owner
                  </p>
                  <p className="mt-1 text-[13.5px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] truncate">
                    {project.owner.name || "Project Lead"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[12px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] uppercase tracking-wider">
                  Assigned Team
                </h4>
              </div>

              <div className="divide-y divide-[#0F2D29]/10 border border-[#0F2D29]/15 bg-white">
                {project.members.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#8FE3C4] text-[#0F2D29] flex items-center justify-center font-bold text-[10px] font-['Goldman',sans-serif]">
                        {initials(m.user.name || "U")}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold font-['Goldman',sans-serif] text-[#0F2D29]">
                          {m.user.name}
                        </p>
                        <p className="text-[11px] text-[#5B6E68]">{m.user.email}</p>
                      </div>
                    </div>
                    <span className="border border-[#0F2D29]/15 bg-[#0F2D29]/5 px-2.5 py-0.5 text-[10.5px] font-bold uppercase text-[#0F2D29] font-['Goldman',sans-serif]">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
};
