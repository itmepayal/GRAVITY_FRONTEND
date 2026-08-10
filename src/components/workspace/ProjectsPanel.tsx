import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Plus, Trash2, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";
import {
  type Project,
  type ProjectStatus,
  type ProjectView,
  PROJECT_STATUS_META,
} from "./types";
import { SharedHelpers } from "./SharedHelpers";
import { ProjectDetailModal } from "./ProjectDetailModal";
import { DeleteProjectModal } from "./DeleteProjectModal";
import { AddProjectModal } from "./AddProjectModal";
import { useCreateProject } from "@/hooks/mutations/project/use-create-project";
import { useDeleteProject } from "@/hooks/mutations/project/use-delete-project";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";

const { PanelToolbar, ViewToggle, PanelEmpty, NoResults } = SharedHelpers;

export const normalizeProject = (raw: any): Project => ({
  _id: raw._id ?? raw.id,
  name: raw.name ?? "Untitled",
  description: raw.description ?? undefined,
  status: raw.status ?? "planning",
  taskCount: raw.taskCount ?? 0,
  completedTaskCount: raw.completedTaskCount ?? 0,
  updatedAt: raw.updatedAt ?? raw.createdAt ?? "Just now",
});

interface ProjectsPanelProps {
  workspaceId: string;
  canManage: boolean;
  onChange: (projects: Project[]) => void;
  addActivity: (action: string, target: string, iconType: "project") => void;
  addToast: (type: "success" | "info" | "warning", msg: string) => void;
}

export const ProjectsPanel = ({
  workspaceId,
  canManage,
  onChange,
  addActivity,
  addToast,
}: ProjectsPanelProps) => {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ProjectView>("grid");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const {
    data: projectsResponse,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
  } = useGetWorkspaceProjects(workspaceId);

  const { mutate: createProjectMutation, isPending: isCreatingProject } = useCreateProject();
  const { mutate: deleteProjectMutation, isPending: isDeletingProject } = useDeleteProject();

  useEffect(() => {
    const raw = Array.isArray(projectsResponse) ? projectsResponse : (projectsResponse?.data ?? []);
    const normalized = raw.map(normalizeProject);
    setProjects(normalized);
    onChange(normalized);
  }, [projectsResponse]);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSubmit = (name: string, description: string, status: ProjectStatus) => {
    createProjectMutation(
      {
        workspaceId,
        data: { name, description, status },
      },
      {
        onSuccess: (response: any) => {
          const newProj = response?.data ?? response;
          if (newProj) {
            const normalized = normalizeProject(newProj);
            setProjects((prev) => [normalized, ...prev]);
            addActivity("created project", name, "project");
            addToast("success", `Created "${name}" project!`);
          }
          setShowForm(false);
          queryClient.invalidateQueries({ queryKey: ["workspace-projects", workspaceId] });
        },
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : "Failed to create project.";
          addToast("warning", message);
        },
      }
    );
  };

  const removeProject = (proj: Project) => {
    const previous = projects;
    setProjects((prev) => prev.filter((p) => p._id !== proj._id));
    deleteProjectMutation(proj._id, {
      onSuccess: () => {
        addActivity("deleted project", proj.name, "project");
        addToast("info", `Deleted "${proj.name}".`);
        setDeletingProject(null);
        queryClient.invalidateQueries({ queryKey: ["workspace-projects", workspaceId] });
      },
      onError: () => {
        setProjects(previous);
      },
    });
  };

  return (
    <div className="space-y-4">
      <PanelToolbar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter projects by title..."
        action={
          canManage ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 bg-[#0F2D29] px-3.5 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif] text-white shadow-2xs hover:bg-[#081E1B] transition"
            >
              <Plus size={15} strokeWidth={2.5} />
              New Project
            </button>
          ) : undefined
        }
      >
        <ViewToggle view={view} onChange={setView} />
      </PanelToolbar>

      {isLoadingProjects ? (
        <div className="flex items-center justify-center gap-2 py-12">
          <Loader2 size={20} className="animate-spin text-[#0F2D29]" />
          <span className="text-[13px] font-semibold text-[#5B6E68]">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <PanelEmpty
          title="No projects in workspace"
          description="Create your first project to start organizing tasks."
          action={
            canManage ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 bg-[#0F2D29] text-white px-4 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif]"
              >
                Create Project
              </button>
            ) : undefined
          }
        />
      ) : filtered.length === 0 ? (
        <NoResults />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const meta = PROJECT_STATUS_META[p.status];
            return (
              <div
                key={p._id}
                onClick={() => setSelectedProject(p)}
                className="group border border-[#0F2D29]/15 bg-white p-5 hover:border-[#0F2D29] transition shadow-2xs cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="border px-2 py-0.5 text-[10.5px] font-bold uppercase" style={{ color: meta.color, backgroundColor: meta.bg, borderColor: `${meta.color}40` }}>
                      {meta.label}
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProject(p);
                        }}
                        className="p-1 text-[#5B6E68] hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <h4 className="text-[16px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] truncate">{p.name}</h4>
                  <p className="mt-1 text-[12.5px] text-[#5B6E68] line-clamp-2">{p.description || "No description."}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#0F2D29]/10 flex items-center justify-between text-[12px] font-semibold text-[#5B6E68]">
                  <span>{p.taskCount} tasks</span>
                  <span className="flex items-center gap-1 text-[#0F2D29] font-bold font-['Goldman',sans-serif]">View <ArrowUpRight size={14} /></span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#0F2D29]/12 bg-white shadow-2xs">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#0F2D29]/5 border-b border-[#0F2D29]/10 text-[11px] font-bold uppercase text-[#5B6E68]">
              <tr>
                <th className="py-3 px-4 font-['Goldman',sans-serif]">Project Name</th>
                <th className="py-3 px-4 font-['Goldman',sans-serif]">Status</th>
                <th className="py-3 px-4 font-['Goldman',sans-serif]">Tasks</th>
                {canManage && <th className="py-3 px-4 text-right font-['Goldman',sans-serif]">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F2D29]/8">
              {filtered.map((p) => (
                <tr key={p._id} onClick={() => setSelectedProject(p)} className="hover:bg-[#0F2D29]/4 cursor-pointer">
                  <td className="py-3 px-4 font-bold text-[#0F2D29] font-['Goldman',sans-serif]">{p.name}</td>
                  <td className="py-3 px-4"><span className="border px-2 py-0.5 text-[10.5px] font-bold uppercase" style={{ color: PROJECT_STATUS_META[p.status].color, backgroundColor: PROJECT_STATUS_META[p.status].bg }}>{PROJECT_STATUS_META[p.status].label}</span></td>
                  <td className="py-3 px-4 font-semibold">{p.taskCount} tasks</td>
                  {canManage && (
                    <td className="py-3 px-4 text-right">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setDeletingProject(p); }} className="p-1 text-[#5B6E68] hover:text-red-600"><Trash2 size={15} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <AddProjectModal onClose={() => setShowForm(false)} onSubmit={handleCreateSubmit} isSubmitting={isCreatingProject} />}
      {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      {deletingProject && <DeleteProjectModal project={deletingProject} isDeleting={isDeletingProject} onClose={() => setDeletingProject(null)} onConfirm={() => removeProject(deletingProject)} />}
    </div>
  );
};
