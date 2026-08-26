import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import {
  WorkspaceMetricsBanner,
  WorkspaceFilterBar,
  WorkspaceGridView,
  WorkspaceTableView,
  WorkspaceKanbanView,
  WorkspaceLoadingSkeleton,
  WorkspaceEmptyState,
  WorkspacePendingInvitesBanner,
  WorkspaceInviteModal,
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
import { useGetMyPendingInvitations } from "@/hooks/queries/invitation/use-get-my-pending-invitations";
import { useGetWorkspaceRoles } from "@/hooks/queries/workspace/use-get-workspace-roles";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";
import { useCreateEmailInvitation } from "@/hooks/mutations/invitation/use-create-email-invitation";
import { useCreateInviteLink } from "@/hooks/mutations/invitation/use-create-invite-link";
import { useAcceptInvitation } from "@/hooks/mutations/invitation/use-accept-invitation";
import { useRejectInvitation } from "@/hooks/mutations/invitation/use-reject-invitation";
import {
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Loader2,
  UserPlus,
  RefreshCw,
} from "lucide-react";

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
    visibilityFilter,
    setVisibilityFilter,
    roleFilter,
    setRoleFilter,
    activeWorkspace,
    canManageActiveWorkspace,
    totals,
    filtered,
    totalGoalsCount,
    users,
    isLoadingWorkspaces,
    isWorkspacesError,
    isLoadingActiveWorkspace,
    isFetchingActiveWorkspace,
    isActiveWorkspaceError,
    isCreatingWorkspace,
    isUpdatingWorkspace,
    isDeletingWorkspace,
    isRemovingMember,
    isUpdatingMemberRole,
    createWorkspace,
    handleCreated,
    handleCreateError,
    handleDeleted,
    patchWorkspace,
    addActivity,
    handleUpdateMemberRole,
    handleRemoveMember,
    addToast,
  } = useWorkspacesState();

  const { data: pendingInvitations, isLoading: isLoadingInvitations } =
    useGetMyPendingInvitations();

  const invitationsList = Array.isArray(pendingInvitations)
    ? pendingInvitations
    : ((pendingInvitations as any)?.data ?? []);

  const [dismissedInvites, setDismissedInvites] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkRoleId, setLinkRoleId] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: rolesResponse } = useGetWorkspaceRoles(
    activeWorkspace?._id ?? "",
  );
  const { data: allUsersResponse, isLoading: isLoadingAllUsers } =
    useGetAllUsers();

  const roles = (rolesResponse as any)?.data ?? [];
  const allUsers = allUsersResponse || users || [];

  const existingMemberIds = new Set(
    (activeWorkspace?.members ?? []).map(
      (m: any) => m.user?.id ?? m.user?._id ?? m.userId,
    ),
  );

  const invitableUsers = allUsers.filter(
    (u: any) => !existingMemberIds.has(u.id ?? u._id),
  );

  const { mutate: sendInvite, isPending: isInviting } =
    useCreateEmailInvitation();
  const { mutate: generateLink, isPending: isGeneratingLink } =
    useCreateInviteLink();
  const { mutate: acceptInvitation, isPending: isAcceptingInvitation } =
    useAcceptInvitation();
  const { mutate: rejectInvitation, isPending: isRejectingInvitation } =
    useRejectInvitation();

  const resetInviteModal = () => {
    setInviteOpen(false);
    setInviteEmail("");
    setInviteRoleId("");
    setInviteLink(null);
    setLinkRoleId("");
    setCopied(false);
  };

  const handleInvite = () => {
    if (!activeWorkspace?._id) return;
    if (!inviteEmail.trim() || !inviteRoleId) return;

    sendInvite(
      {
        workspaceId: activeWorkspace._id,
        data: { email: inviteEmail.trim(), roleId: inviteRoleId },
      },
      {
        onSuccess: () => {
          toast.success("Invitation sent");
          addActivity(
            activeWorkspace._id,
            "invited",
            inviteEmail.trim(),
            "member",
          );
          resetInviteModal();
        },
        onError: () => {
          toast.error("Couldn't send invitation");
        },
      },
    );
  };

  const handleGenerateLink = () => {
    if (!activeWorkspace?._id || !linkRoleId) return;

    generateLink(
      {
        workspaceId: activeWorkspace._id,
        data: { roleId: linkRoleId },
      },
      {
        onSuccess: (response: any) => {
          const link =
            response?.data?.link ??
            response?.data?.url ??
            (response?.data?.token
              ? `${window.location.origin}/invite/${response.data.token}`
              : null);
          setInviteLink(link);
          setCopied(false);
        },
        onError: () => {
          toast.error("Couldn't generate invite link");
        },
      },
    );
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

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

  const hasActiveFilters = Boolean(
    query.trim() ||
      visibilityFilter !== "all" ||
      roleFilter !== "all",
  );

  const showDetailLayout =
    viewMode === "detail" || activeSection === "goals";

  const openWorkspaceDetail = (id: string) => {
    setActiveId(id);
    setViewMode("detail");
  };

  return (
    <>
      <Topbar
        variant="light"
        title="Workspaces"
        subtitle={`${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"} · ${totals.projects} projects · ${totals.members} teammates`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        {!isLoadingInvitations &&
          invitationsList.length > 0 &&
          !dismissedInvites && (
            <WorkspacePendingInvitesBanner
              invitations={invitationsList}
              onDismiss={() => setDismissedInvites(true)}
              onAccept={(token) => {
                if (!token || isAcceptingInvitation) return;
                acceptInvitation(token);
              }}
              onDecline={(token) => {
                if (!token || isRejectingInvitation) return;
                rejectInvitation(token);
              }}
            />
          )}

        <WorkspaceMetricsBanner
          totalWorkspaces={workspaces.length}
          totalProjects={totals.projects}
          totalMembers={totals.members}
          totalGoals={totalGoalsCount}
        />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <WorkspaceFilterBar
              searchQuery={query}
              onSearchChange={setQuery}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              visibilityFilter={visibilityFilter}
              onVisibilityFilterChange={setVisibilityFilter}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              workspaceCount={filtered.length}
              onOpenCreateModal={() => setShowCreate(true)}
            />
          </div>

          {activeWorkspace && canManageActiveWorkspace && showDetailLayout && (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="flex shrink-0 items-center gap-1.5 bg-[#0F2D29] px-4 py-2 text-xs font-bold text-white hover:bg-[#081E1B] transition"
            >
              <UserPlus size={14} />
              Invite Teammate
            </button>
          )}
        </div>

        {showDetailLayout ? (
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
                <WorkspaceLoadingSkeleton viewMode="detail" />
              ) : !activeWorkspace ? (
                <EmptyPanel onCreate={() => setShowCreate(true)} />
              ) : isLoadingActiveWorkspace ? (
                <div className="flex min-h-80 items-center justify-center border border-dashed border-[#0F2D29]/15 bg-white">
                  <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
                </div>
              ) : isActiveWorkspaceError ? (
                <div className="flex min-h-80 flex-col items-center justify-center gap-3 border border-dashed border-[#F3B8B4] bg-[#FBEAE9] p-8 text-center">
                  <AlertCircle size={22} className="text-[#B3261E]" />
                  <p className="text-sm font-bold text-[#B3261E]">
                    Couldn't load this workspace
                  </p>
                  <button
                    type="button"
                    onClick={() => activeId && setActiveId(activeId)}
                    className="flex items-center gap-1.5 border border-[#B3261E] px-3 py-2 text-xs font-bold text-[#B3261E]"
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                </div>
              ) : activeSection === "workspace" ? (
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
                  onRemoveMember={(memberId, memberLabel) =>
                    handleRemoveMember(
                      activeWorkspace._id,
                      memberId,
                      memberLabel,
                    )
                  }
                  isRemovingMember={isRemovingMember}
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
                  onOpenInviteTeammate={() => setInviteOpen(true)}
                />
              ) : (
                <WorkspaceGoalsPanel
                  workspaceId={activeWorkspace._id}
                  workspaceName={activeWorkspace.name}
                  canManage={canManageActiveWorkspace}
                />
              )}
            </section>
          </div>
        ) : isLoadingWorkspaces ? (
          <WorkspaceLoadingSkeleton viewMode={viewMode} />
        ) : isWorkspacesError ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3 border border-dashed border-[#F3B8B4] bg-[#FBEAE9] p-8 text-center">
            <AlertCircle size={22} className="text-[#B3261E]" />
            <p className="text-sm font-bold text-[#B3261E]">
              Failed to load workspaces
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 border border-[#B3261E] px-3 py-2 text-xs font-bold text-[#B3261E]"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <WorkspaceEmptyState
            hasActiveFilters={hasActiveFilters}
            onCreateWorkspace={() => setShowCreate(true)}
          />
        ) : (
          <>
            {viewMode === "grid" && (
              <WorkspaceGridView
                workspaces={filtered}
                activeId={activeId}
                onSelectWorkspace={openWorkspaceDetail}
                onOpenCreate={() => setShowCreate(true)}
              />
            )}

            {viewMode === "table" && (
              <WorkspaceTableView
                workspaces={filtered}
                activeId={activeId}
                onSelectWorkspace={openWorkspaceDetail}
              />
            )}

            {viewMode === "kanban" && (
              <WorkspaceKanbanView
                workspaces={filtered}
                activeId={activeId}
                onSelectWorkspace={openWorkspaceDetail}
                onOpenCreate={() => setShowCreate(true)}
              />
            )}
          </>
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

      {inviteOpen && activeWorkspace && (
        <WorkspaceInviteModal
          workspaceName={activeWorkspace.name}
          inviteEmail={inviteEmail}
          onInviteEmailChange={setInviteEmail}
          inviteRoleId={inviteRoleId}
          onInviteRoleIdChange={setInviteRoleId}
          linkRoleId={linkRoleId}
          onLinkRoleIdChange={setLinkRoleId}
          inviteLink={inviteLink}
          copied={copied}
          roles={roles}
          invitableUsers={invitableUsers}
          isLoadingUsers={isLoadingAllUsers}
          isInviting={isInviting}
          isGeneratingLink={isGeneratingLink}
          onClose={resetInviteModal}
          onInvite={handleInvite}
          onGenerateLink={handleGenerateLink}
          onCopyLink={handleCopyLink}
        />
      )}

      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2">
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
