import { useEffect, useState } from "react";
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
import { useCreateBoard } from "@/hooks/mutations/project/use-create-board";
import { CheckCircle2, Sparkles, AlertCircle, Loader2, X } from "lucide-react";

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

  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");

  const { mutate: createBoard, isPending: isCreatingBoard } = useCreateBoard();

  const handleOpenCreateBoard = () => {
    setBoardName("");
    setBoardDescription("");
    setCreateBoardOpen(true);
  };

  const handleSubmitCreateBoard = () => {
    if (!selectedProject || !boardName.trim()) return;
    createBoard(
      {
        projectId: selectedProject.id,
        data: {
          name: boardName.trim(),
          description: boardDescription.trim() || undefined,
        },
      },
      {
        onSuccess: () => setCreateBoardOpen(false),
      },
    );
  };
  // ---------------------------------------------------------------------

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
        <ProjectMetricsBanner
          totalProjects={metrics.totalProjects}
          activeProjects={metrics.activeProjects}
          completedProjects={metrics.completedProjects}
          totalMembers={metrics.totalMembers}
        />

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

      {selectedProject && (
        <ProjectDetailDrawer
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={(proj) => setEditingProject(proj)}
          onDelete={(id) => handleDeleteProject(id)}
          onUpdateStatus={(id, status) => handleUpdateProject(id, { status })}
          onCreateBoard={handleOpenCreateBoard}
        />
      )}

      {createModalOpen && (
        <CreateProjectDialogModal
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateProject}
          isSubmitting={isCreatingProject}
        />
      )}

      {editingProject && (
        <EditProjectDialogModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={(data) => handleUpdateProject(editingProject.id, data)}
          isSubmitting={isUpdatingProject}
        />
      )}

      {/* Create Board Dialog (inline — swap for a dedicated component if you have one) */}
      {createBoardOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md border border-[#0F2D29]/15 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-[#0F2D29]">
                New board for "{selectedProject.name}"
              </h2>
              <button
                onClick={() => setCreateBoardOpen(false)}
                className="flex h-6 w-6 items-center justify-center text-[#0F2D29]/60"
              >
                <X size={14} />
              </button>
            </div>

            <label className="mb-1 block text-[11px] font-bold text-[#0F2D29]/70">
              Board name
            </label>
            <input
              autoFocus
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="e.g. Sprint Board"
              className="mb-3 w-full border border-[#0F2D29]/20 px-3 py-2 text-xs outline-none"
            />

            <label className="mb-1 block text-[11px] font-bold text-[#0F2D29]/70">
              Description (optional)
            </label>
            <textarea
              value={boardDescription}
              onChange={(e) => setBoardDescription(e.target.value)}
              placeholder="What's this board for?"
              rows={3}
              className="mb-4 w-full border border-[#0F2D29]/20 px-3 py-2 text-xs outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCreateBoardOpen(false)}
                className="px-3.5 py-2 text-xs font-bold text-[#0F2D29]/70"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCreateBoard}
                disabled={!boardName.trim() || isCreatingBoard}
                className="bg-[#0F2D29] px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {isCreatingBoard ? "Creating..." : "Create Board"}
              </button>
            </div>
          </div>
        </div>
      )}

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
