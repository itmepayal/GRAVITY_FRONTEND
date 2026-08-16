import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import {
  WorkspaceMetricsBanner,
  WorkspaceFilterBar,
  WorkspaceGridView,
  WorkspaceTableView,
  WorkspaceSidebarPanel,
  WorkspaceDetail,
  WorkspaceGoalsPanel,
  CreateWorkspaceModal,
  EmptyPanel,
} from "@/components/workspace";
import {
  AddProjectModal,
  type AddProjectFormValues,
} from "@/components/workspace/AddProjectModal";
import { useWorkspacesState } from "@/hooks/useWorkspacesState";
import { useCreateProject } from "@/hooks/mutations/project/use-create-project";
import { CheckCircle2, Sparkles, AlertCircle, Loader2 } from "lucide-react";

export const Workspaces = () => {
  const { openMobileNav } = useDashboardContext();

  const {
    workspaces,
    activeId,
    setActiveId,
    showCreate,
    setShowCreate,
    query,
    setQuery,
    toasts,
    deletingId,
    activeSection,
    setActiveSection,
    viewMode,
    setViewMode,
    activeWorkspace,
    canManageActiveWorkspace,
    totals,
    filtered,
    totalGoalsCount,
    users,
    isLoadingUsers,
    isLoadingWorkspaces,
    isWorkspacesError,
    isLoadingActiveWorkspace,
    isFetchingActiveWorkspace,
    isActiveWorkspaceError,
    isCreatingWorkspace,
    isUpdatingWorkspace,
    isDeletingWorkspace,
    isAddingMember,
    isRemovingMember,
    isUpdatingMemberRole,
    createWorkspace,
    handleCreated,
    handleCreateError,
    handleDeleted,
    patchWorkspace,
    addActivity,
    handleAddMember,
    handleUpdateMemberRole,
    handleRemoveMember,
    addToast,
  } = useWorkspacesState();

  // --- Add Project modal ---
  const [showAddProject, setShowAddProject] = useState(false);
  const { mutate: createProject, isPending: isCreatingProject } =
    useCreateProject();

  const handleCreateProject = (values: AddProjectFormValues) => {
    if (!activeWorkspace?._id) {
      toast.warning("Select a workspace first");
      return;
    }

    createProject(
      {
        workspaceId: activeWorkspace._id,
        data: {
          name: values.name,
          description: values.description || undefined,
          status: values.status,
          color: values.color,
          startDate: values.startDate || undefined,
          dueDate: values.dueDate || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowAddProject(false);
        },
      },
    );
  };
  // --- end Add Project modal ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        document.getElementById("workspace-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Topbar
        variant="light"
        title="Workspaces"
        subtitle={`${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"} · ${totals.projects} projects · ${totals.members} teammates`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Workspace Metrics Banner */}
        <WorkspaceMetricsBanner
          totalWorkspaces={workspaces.length}
          totalProjects={totals.projects}
          totalMembers={totals.members}
          totalGoals={totalGoalsCount}
        />

        {/* Workspace Filter & Controls Bar */}
        <WorkspaceFilterBar
          searchQuery={query}
          onSearchChange={setQuery}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalWorkspaces={workspaces.length}
          onOpenCreateModal={() => setShowCreate(true)}
        />

        {/* View Mode Engines */}
        {viewMode === "grid" && activeSection === "workspace" && (
          <WorkspaceGridView
            workspaces={filtered}
            activeId={activeId}
            onSelectWorkspace={(id) => {
              setActiveId(id);
              setViewMode("detail");
            }}
            onOpenCreate={() => setShowCreate(true)}
          />
        )}

        {viewMode === "table" && activeSection === "workspace" && (
          <WorkspaceTableView
            workspaces={filtered}
            activeId={activeId}
            onSelectWorkspace={(id) => {
              setActiveId(id);
              setViewMode("detail");
            }}
            onOpenCreate={() => setShowCreate(true)}
          />
        )}

        {(viewMode === "detail" || activeSection === "goals") && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <WorkspaceSidebarPanel
              workspaces={workspaces}
              filteredWorkspaces={filtered}
              activeId={activeId}
              onSelectWorkspace={setActiveId}
              query={query}
              onQueryChange={setQuery}
              isLoadingWorkspaces={isLoadingWorkspaces}
              isWorkspacesError={isWorkspacesError}
              onOpenCreate={() => setShowCreate(true)}
            />

            <section className="min-w-0 flex-1">
              {isLoadingWorkspaces ? (
                <div className="flex min-h-115 items-center justify-center border border-dashed border-[#0F2D29]/15 bg-white">
                  <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
                </div>
              ) : !activeWorkspace ? (
                <EmptyPanel onCreate={() => setShowCreate(true)} />
              ) : isLoadingActiveWorkspace ? (
                <div className="flex min-h-115 items-center justify-center border border-dashed border-[#0F2D29]/15 bg-white">
                  <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
                </div>
              ) : isActiveWorkspaceError ? (
                <div className="flex min-h-115 flex-col items-center justify-center gap-2 border border-dashed border-[#0F2D29]/15 bg-white text-center">
                  <AlertCircle size={22} className="text-red-500" />
                  <p className="text-[13.5px] font-medium text-[#0F2D29]">
                    Couldn't load this workspace
                  </p>
                  <p className="text-[12px] text-[#8FA69E]">
                    Please try selecting it again.
                  </p>
                </div>
              ) : (
                <>
                  {activeSection === "workspace" ? (
                    <WorkspaceDetail
                      key={activeWorkspace._id}
                      workspace={activeWorkspace}
                      isRefreshing={
                        isFetchingActiveWorkspace || isUpdatingWorkspace
                      }
                      isDeleting={
                        isDeletingWorkspace &&
                        deletingId === activeWorkspace._id
                      }
                      onUpdated={(patch) =>
                        patchWorkspace(activeWorkspace._id, patch)
                      }
                      onDeleted={() => handleDeleted(activeWorkspace._id)}
                      onAddMember={(memberData) =>
                        handleAddMember(activeWorkspace._id, memberData)
                      }
                      isAddingMember={isAddingMember}
                      onRemoveMember={(memberId, memberLabel) =>
                        handleRemoveMember(
                          activeWorkspace._id,
                          memberId,
                          memberLabel,
                        )
                      }
                      isRemovingMember={isRemovingMember}
                      users={users}
                      isLoadingUsers={isLoadingUsers}
                      addActivity={(action, target, iconType) =>
                        addActivity(
                          activeWorkspace._id,
                          action,
                          target,
                          iconType,
                        )
                      }
                      addToast={addToast}
                      onUpdateMemberRole={(memberId, newRole, memberLabel) =>
                        handleUpdateMemberRole(
                          activeWorkspace._id,
                          memberId,
                          newRole as any,
                          memberLabel,
                        )
                      }
                      isUpdatingMemberRole={isUpdatingMemberRole}
                      onOpenAddProject={() => setShowAddProject(true)}
                    />
                  ) : (
                    <WorkspaceGoalsPanel
                      workspaceId={activeWorkspace._id}
                      workspaceName={activeWorkspace.name}
                      canManage={canManageActiveWorkspace}
                    />
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </main>

      {showCreate && (
        <CreateWorkspaceModal
          onClose={() => setShowCreate(false)}
          isSubmitting={isCreatingWorkspace}
          onCreated={(ws) => {
            createWorkspace(ws, {
              onSuccess: (response: any) => {
                const savedWorkspace = response?.data ?? response;
                handleCreated({ ...ws, ...savedWorkspace });
              },
              onError: (error: unknown) => {
                handleCreateError(error);
              },
            });
          }}
        />
      )}

      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          isSubmitting={isCreatingProject}
          onSubmit={handleCreateProject}
        />
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

export default Workspaces;
