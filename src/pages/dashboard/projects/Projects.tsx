import { useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import {
  ProjectMetricsBanner,
  ProjectFilterBar,
  ProjectGridView,
  ProjectTableView,
  ProjectKanbanView,
  ProjectDetailDrawer,
  CreateProjectDialogModal,
  EditProjectDialogModal,
} from "@/components/project";
import { useProjectsState } from "@/hooks/useProjectsState";
import { CheckCircle2, Sparkles, AlertCircle, Loader2 } from "lucide-react";

export const Projects = () => {
  const { openMobileNav } = useDashboardContext();

  const {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    createModalOpen,
    setCreateModalOpen,
    selectedProject,
    setSelectedProject,
    editingProject,
    setEditingProject,
    toasts,
    projects,
    metrics,
    isLoadingProjects,
    isCreatingProject,
    isUpdatingProject,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
  } = useProjectsState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        document.getElementById("project-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Topbar
        variant="light"
        title="Projects"
        subtitle={`${metrics.totalProjects} total project${metrics.totalProjects === 1 ? "" : "s"} · ${metrics.activeProjects} active delivery`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Project Metrics Banner */}
        <ProjectMetricsBanner
          totalProjects={metrics.totalProjects}
          activeProjects={metrics.activeProjects}
          completedProjects={metrics.completedProjects}
          totalMembers={metrics.totalMembers}
        />

        {/* Project Filter & Control Bar */}
        <ProjectFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedWorkspaceId={selectedWorkspaceId}
          onWorkspaceChange={setSelectedWorkspaceId}
          workspaces={workspaces}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenCreateModal={() => setCreateModalOpen(true)}
        />

        {/* View Mode Engines */}
        {isLoadingProjects ? (
          <div className="flex min-h-80 items-center justify-center border border-dashed border-[#0F2D29]/15 bg-white">
            <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
          </div>
        ) : (
          <>
            {viewMode === "grid" && (
              <ProjectGridView
                projects={projects}
                onSelectProject={(proj) => setSelectedProject(proj)}
                onOpenCreate={() => setCreateModalOpen(true)}
              />
            )}

            {viewMode === "table" && (
              <ProjectTableView
                projects={projects}
                onSelectProject={(proj) => setSelectedProject(proj)}
                onOpenCreate={() => setCreateModalOpen(true)}
              />
            )}

            {viewMode === "kanban" && (
              <ProjectKanbanView
                projects={projects}
                onSelectProject={(proj) => setSelectedProject(proj)}
                onOpenCreate={() => setCreateModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Project Side Detail Drawer */}
      {selectedProject && (
        <ProjectDetailDrawer
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={(proj) => setEditingProject(proj)}
          onDelete={(id) => handleDeleteProject(id)}
          onUpdateStatus={(id, status) => handleUpdateProject(id, { status })}
        />
      )}

      {/* Create Project Dialog Modal */}
      {createModalOpen && (
        <CreateProjectDialogModal
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateProject}
          isSubmitting={isCreatingProject}
        />
      )}

      {/* Edit Project Dialog Modal */}
      {editingProject && (
        <EditProjectDialogModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={(data) => handleUpdateProject(editingProject.id, data)}
          isSubmitting={isUpdatingProject}
        />
      )}

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 border border-[#0F2D29] bg-[#0F2D29] px-4 py-3 text-[13px] font-semibold text-white shadow-xl"
          >
            {t.type === "success" && (
              <CheckCircle2 size={16} className="text-[#8FE3C4]" />
            )}
            {t.type === "info" && (
              <Sparkles size={16} className="text-[#93C5FD]" />
            )}
            {t.type === "warning" && (
              <AlertCircle size={16} className="text-[#FCD34D]" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Projects;
