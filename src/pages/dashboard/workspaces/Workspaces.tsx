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
import { useGetMyPendingInvitations } from "@/hooks/queries/invitation/use-get-my-pending-invitations"; // adjust path to match your project structure
import { useGetWorkspaceRoles } from "@/hooks/queries/workspace/use-get-workspace-roles";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";
import { useCreateEmailInvitation } from "@/hooks/mutations/invitation/use-create-email-invitation";
import { useCreateInviteLink } from "@/hooks/mutations/invitation/use-create-invite-link";
import {
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Loader2,
  Mail,
  X,
  UserPlus,
  Link as LinkIcon,
  Copy,
  Check,
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

  // --- Pending invitations (invites sent TO the current user) ---
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
    } catch {}
  };
  // --- end invite teammate modal ---

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
        {/* Pending Invitations Banner */}
        {!isLoadingInvitations &&
          invitationsList.length > 0 &&
          !dismissedInvites && (
            <div className="flex items-start gap-3 border border-[#0F8A65]/30 bg-[#0F8A65]/5 p-4 sm:p-5">
              <Mail size={18} className="mt-0.5 shrink-0 text-[#0F8A65]" />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-[#0F2D29]">
                  You have {invitationsList.length} pending workspace invitation
                  {invitationsList.length === 1 ? "" : "s"}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {invitationsList.map((invite: any) => (
                    <li
                      key={invite._id}
                      className="flex flex-wrap items-center gap-2 text-[12.5px] text-[#0F2D29]/80"
                    >
                      <span>
                        <span className="font-medium">
                          {invite.workspaceName ??
                            invite.workspace?.name ??
                            "A workspace"}
                        </span>
                        {invite.invitedBy && (
                          <> · invited by {invite.invitedBy}</>
                        )}
                      </span>
                      <button
                        type="button"
                        className="border border-[#0F8A65] px-2 py-0.5 text-[11px] font-semibold text-[#0F8A65] hover:bg-[#0F8A65] hover:text-white"
                        onClick={() => {
                          // TODO: wire up accept mutation, e.g. acceptInvitation(invite._id)
                          addToast?.("info", "Accept flow not wired up yet");
                        }}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="border border-[#0F2D29]/20 px-2 py-0.5 text-[11px] font-semibold text-[#0F2D29]/70 hover:bg-[#0F2D29]/5"
                        onClick={() => {
                          // TODO: wire up decline mutation, e.g. declineInvitation(invite._id)
                          addToast?.("info", "Decline flow not wired up yet");
                        }}
                      >
                        Decline
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                className="shrink-0 text-[#0F2D29]/40 hover:text-[#0F2D29]"
                onClick={() => setDismissedInvites(true)}
              >
                <X size={16} />
              </button>
            </div>
          )}

        {/* Workspace Metrics Banner */}
        <WorkspaceMetricsBanner
          totalWorkspaces={workspaces.length}
          totalProjects={totals.projects}
          totalMembers={totals.members}
          totalGoals={totalGoalsCount}
        />

        {/* Workspace Filter & Controls Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
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
          </div>

          {activeWorkspace && canManageActiveWorkspace && (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="flex shrink-0 items-center gap-1.5 bg-[#0F2D29] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#0F2D29]/90"
            >
              <UserPlus size={15} />
              Invite teammate
            </button>
          )}
        </div>

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

      {/* Invite teammate modal — mirrors Members.tsx invite flow, scoped to the active workspace */}
      {inviteOpen && activeWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#0F2D29]/15 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-[#0F2D29]">
                Invite teammate to {activeWorkspace.name}
              </h2>
              <button onClick={resetInviteModal}>
                <X size={16} className="text-[#0F2D29]/60" />
              </button>
            </div>

            <label className="mb-1 block text-[11px] font-bold text-[#0F2D29]/70">
              User
            </label>
            <select
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={isLoadingAllUsers}
              className="mb-3 w-full rounded-lg border border-[#0F2D29]/20 px-3 py-2 text-xs outline-none disabled:opacity-50"
            >
              <option value="">
                {isLoadingAllUsers ? "Loading users..." : "Select a user"}
              </option>
              {invitableUsers.map((u: any) => (
                <option key={u.id ?? u._id} value={u.email}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            <label className="mb-1 block text-[11px] font-bold text-[#0F2D29]/70">
              Role
            </label>
            <select
              value={inviteRoleId}
              onChange={(e) => setInviteRoleId(e.target.value)}
              className="mb-4 w-full rounded-lg border border-[#0F2D29]/20 px-3 py-2 text-xs outline-none"
            >
              <option value="">Select role</option>
              {roles
                .filter((r: any) => r.name !== "Owner")
                .map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>

            <div className="mb-4 flex justify-end gap-2">
              <button
                onClick={resetInviteModal}
                className="px-3.5 py-2 text-xs font-bold text-[#0F2D29]/70"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || !inviteRoleId || isInviting}
                className="rounded-lg bg-[#0F2D29] px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {isInviting ? "Inviting..." : "Send invite"}
              </button>
            </div>

            <div className="my-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-[#0F2D29]/10" />
              <span className="text-[10px] font-bold text-[#8FA69E] uppercase">
                Or
              </span>
              <div className="h-px flex-1 bg-[#0F2D29]/10" />
            </div>

            <label className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-[#0F2D29]/70">
              <LinkIcon size={12} />
              Invite via link
            </label>
            <select
              value={linkRoleId}
              onChange={(e) => setLinkRoleId(e.target.value)}
              className="mb-3 w-full rounded-lg border border-[#0F2D29]/20 px-3 py-2 text-xs outline-none"
            >
              <option value="">Select role for link</option>
              {roles
                .filter((r: any) => r.name !== "Owner")
                .map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>

            {!inviteLink ? (
              <button
                onClick={handleGenerateLink}
                disabled={!linkRoleId || isGeneratingLink}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#0F2D29]/20 px-3.5 py-2 text-xs font-bold text-[#0F2D29] hover:bg-[#0F2D29]/5 disabled:opacity-50"
              >
                {isGeneratingLink ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <LinkIcon size={13} />
                    Generate invite link
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className="min-w-0 flex-1 rounded-lg border border-[#0F2D29]/20 bg-[#0F2D29]/3 px-3 py-2 text-[11px] text-[#0F2D29]/80 outline-none"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={handleCopyLink}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#0F2D29]/20 text-[#0F2D29] hover:bg-[#0F2D29]/5"
                  aria-label="Copy invite link"
                >
                  {copied ? (
                    <Check size={14} className="text-[#0F8A65]" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            )}
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

export default Workspaces;
