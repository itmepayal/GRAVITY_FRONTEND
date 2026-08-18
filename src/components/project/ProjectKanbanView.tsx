import React, { useEffect, useState } from "react";
import { Plus, Layers, ArrowRight } from "lucide-react";
import { type Project, type ProjectStatus, STATUS_META } from "./types";

export interface ProjectKanbanViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenCreate: () => void;
  onDropProjectToColumn: (projectId: string, status: ProjectStatus) => void;
}

const KANBAN_COLUMNS: ProjectStatus[] = [
  "planning",
  "active",
  "on_hold",
  "completed",
];

export const ProjectKanbanView: React.FC<ProjectKanbanViewProps> = ({
  projects,
  onSelectProject,
  onOpenCreate,
  onDropProjectToColumn,
}) => {
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(
    null,
  );
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);

  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const handleDrop = (colStatus: ProjectStatus) => {
    if (draggedProjectId) {
      const project = localProjects.find((p) => p.id === draggedProjectId);
      if (project && project.status !== colStatus) {
        setLocalProjects((prev) =>
          prev.map((p) =>
            p.id === draggedProjectId ? { ...p, status: colStatus } : p,
          ),
        );
        onDropProjectToColumn(draggedProjectId, colStatus);
      }
    }
    setDraggedProjectId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {KANBAN_COLUMNS.map((colStatus) => {
        const meta = STATUS_META[colStatus];
        const StatusIcon = meta.icon;
        const colProjects = localProjects.filter((p) => p.status === colStatus);
        const isOver = dragOverColumn === colStatus;

        return (
          <div
            key={colStatus}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(colStatus);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={() => handleDrop(colStatus)}
            className={`flex flex-col border border-[#0F2D29]/15 bg-[#0F2D29]/2 p-4 shadow-2xs transition-all duration-200 ${
              isOver
                ? "border-[#0F2D29] bg-[#0F2D29]/5 ring-2 ring-[#0F2D29]/30 scale-[1.01]"
                : ""
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#0F2D29]/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center border"
                  style={{
                    color: meta.color,
                    backgroundColor: meta.bg,
                    borderColor: meta.border,
                  }}
                >
                  <StatusIcon size={14} />
                </span>
                <h4 className="text-[14px] font-bold font-['Goldman',sans-serif] text-[#0F2D29]">
                  {meta.label}
                </h4>
              </div>
              <span className="flex h-5 min-w-5 items-center justify-center bg-[#0F2D29] px-1.5 text-[10.5px] font-bold text-white font-['Goldman',sans-serif]">
                {colProjects.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 min-h-64">
              {colProjects.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center border border-dashed border-[#0F2D29]/15 bg-white p-4 text-center">
                  <p className="text-[12px] font-semibold text-[#5B6E68]">
                    No {meta.label.toLowerCase()} projects
                  </p>
                </div>
              ) : (
                colProjects.map((proj) => (
                  <div
                    key={proj.id}
                    draggable
                    onDragStart={() => setDraggedProjectId(proj.id)}
                    onDragEnd={() => {
                      setDraggedProjectId(null);
                      setDragOverColumn(null);
                    }}
                    onClick={() => onSelectProject(proj)}
                    className={`group border border-[#0F2D29]/15 bg-white p-4 hover:border-[#0F2D29] transition shadow-2xs cursor-grab active:cursor-grabbing flex flex-col justify-between ${
                      draggedProjectId === proj.id ? "opacity-40" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div
                          className="h-2 w-8"
                          style={{ backgroundColor: proj.color || "#0F2D29" }}
                        />
                        <span className="text-[11px] font-bold text-[#5B6E68] font-['Goldman',sans-serif]">
                          {proj.progress}%
                        </span>
                      </div>

                      <h5 className="text-[15px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] truncate">
                        {proj.name}
                      </h5>
                      {proj.description && (
                        <p className="mt-1 text-[12px] font-medium text-[#5B6E68] line-clamp-2">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-[#0F2D29]/10 flex items-center justify-between text-[11.5px] font-semibold text-[#5B6E68]">
                      <span className="flex items-center gap-1">
                        <Layers size={13} className="text-[#0F2D29]" />
                        {proj.tasksCount} Tasks
                      </span>
                      <span className="flex items-center gap-1 text-[#0F2D29] font-bold font-['Goldman',sans-serif] group-hover:translate-x-0.5 transition-transform">
                        View <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={onOpenCreate}
              className="mt-4 flex w-full items-center justify-center gap-1.5 border border-dashed border-[#0F2D29]/20 bg-white py-2 text-[12px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] hover:bg-[#0F2D29] hover:text-white transition"
            >
              <Plus size={14} />
              Add Project
            </button>
          </div>
        );
      })}
    </div>
  );
};
