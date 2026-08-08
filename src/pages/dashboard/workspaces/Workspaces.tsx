import { useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Building2,
  Layers,
  Search,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import {
  type Workspace,
  type Member,
  type Toast,
  nextId,
  WorkspaceListItem,
  WorkspaceDetail,
  CreateWorkspaceModal,
  type Role,
} from "@/components/workspace";
import { useCreateWorkspace } from "@/hooks/mutations/workspace/use-create-workspace";
import { useUpdateWorkspace } from "@/hooks/mutations/workspace/use-update-workspace";
import { useDeleteWorkspace } from "@/hooks/mutations/workspace/use-delete-workspace";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceById } from "@/hooks/queries/workspace/use-get-workspace-by-id";
import { useAddWorkspaceMember } from "@/hooks/mutations/workspace/use-add-workspace-member";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";
import { useRemoveWorkspaceMember } from "@/hooks/mutations/workspace/use-remove-workspace-member";
import { useUpdateWorkspaceMemberRole } from "@/hooks/mutations/workspace/update-workspace-member-role";

const normalizeMember = (raw: any): Member => {
  const user = raw?.user ?? {};
  return {
    _id: raw._id ?? nextId("m"),
    user: {
      id: user._id ?? user.id ?? nextId("u"),
      name: user.name ?? raw.name ?? "Unknown",
      email: user.email ?? raw.email ?? "",
      avatar: user.avatar ?? raw.avatar ?? null,
    },
    role: raw.role ?? "member",
    joinedAt: raw.joinedAt ?? raw.createdAt ?? new Date().toISOString(),
  };
};

const normalizeUser = (raw: any) => ({
  id: raw._id ?? raw.id,
  name: raw.name ?? raw.email ?? "Unknown",
  email: raw.email ?? "",
  avatar: raw.avatar ?? null,
});

const normalizeWorkspace = (raw: any): Workspace => ({
  ...raw,
  _id: raw._id ?? raw.id,
  role: raw.role ?? "member",
  projects: raw.projects ?? [],
  members: (raw.members ?? []).map(normalizeMember),
  roles: raw.roles ?? [],
  activityLog: raw.activityLog ?? [],
});

const Workspaces = () => {
  const { openMobileNav } = useDashboardContext();
  const queryClient = useQueryClient();

  const { mutate: createWorkspace, isPending: isCreatingWorkspace } =
    useCreateWorkspace();
  const { mutate: updateWorkspaceMutation, isPending: isUpdatingWorkspace } =
    useUpdateWorkspace();
  const { mutate: deleteWorkspaceMutation, isPending: isDeletingWorkspace } =
    useDeleteWorkspace();
  const {
    data: workspacesResponse,
    isLoading: isLoadingWorkspaces,
    isError: isWorkspacesError,
  } = useGetUserWorkspaces();
  const { mutate: addWorkspaceMemberMutation, isPending: isAddingMember } =
    useAddWorkspaceMember();
  const { mutate: removeWorkspaceMemberMutation, isPending: isRemovingMember } =
    useRemoveWorkspaceMember();
  const { mutate: updateMemberRoleMutation, isPending: isUpdatingMemberRole } =
    useUpdateWorkspaceMemberRole();
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetAllUsers();
  const users = useMemo(() => {
    const raw = Array.isArray(usersResponse)
      ? usersResponse
      : (usersResponse ?? []);
    return raw.map(normalizeUser);
  }, [usersResponse]);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: activeWorkspaceResponse,
    isLoading: isLoadingActiveWorkspace,
    isFetching: isFetchingActiveWorkspace,
    isError: isActiveWorkspaceError,
  } = useGetWorkspaceById(activeId ?? "");

  useEffect(() => {
    const raw = Array.isArray(workspacesResponse)
      ? workspacesResponse
      : (workspacesResponse?.data ?? []);

    const normalized = raw.map(normalizeWorkspace);
    setWorkspaces(normalized);

    setActiveId((cur) => {
      if (cur && normalized.some((w) => w._id === cur)) return cur;
      return normalized[0]?._id ?? null;
    });
  }, [workspacesResponse]);

  useEffect(() => {
    if (!activeWorkspaceResponse) return;

    const raw = activeWorkspaceResponse?.data ?? activeWorkspaceResponse;
    const normalized = normalizeWorkspace(raw);

    setWorkspaces((prev) =>
      prev.map((w) => (w._id === normalized._id ? { ...w, ...normalized } : w)),
    );
  }, [activeWorkspaceResponse]);

  const addToast = (type: "success" | "info" | "warning", message: string) => {
    const id = nextId("tst");
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const activeWorkspace = workspaces.find((w) => w._id === activeId) ?? null;

  const totals = useMemo(
    () => ({
      projects: workspaces.reduce((n, w) => n + (w.projects?.length ?? 0), 0),
      members: workspaces.reduce((n, w) => n + (w.members?.length ?? 0), 0),
    }),
    [workspaces],
  );

  const filtered = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      w.description?.toLowerCase().includes(query.toLowerCase()),
  );

  const handleCreated = (ws: Workspace) => {
    const safeWs = normalizeWorkspace(ws);
    setWorkspaces((prev) => [safeWs, ...prev]);
    setActiveId(safeWs._id);
    setShowCreate(false);
    addToast("success", `Workspace "${safeWs.name}" created successfully!`);
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });
  };

  const handleCreateError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Failed to create workspace.";
    addToast("warning", message);
  };

  const handleDeleted = (id: string) => {
    const wsToDelete = workspaces.find((w) => w._id === id);
    const wsName = wsToDelete?.name || "Workspace";
    const previousWorkspaces = workspaces;

    setDeletingId(id);

    deleteWorkspaceMutation(id, {
      onSuccess: () => {
        setWorkspaces((prev) => prev.filter((w) => w._id !== id));
        setActiveId((cur) => (cur === id ? null : cur));
        addToast("info", `Deleted "${wsName}".`);
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      },
      onError: () => {
        setWorkspaces(previousWorkspaces);
      },
      onSettled: () => {
        setDeletingId(null);
      },
    });
  };

  const patchWorkspace = (id: string, patch: Partial<Workspace>) => {
    const previous = workspaces.find((w) => w._id === id);
    setWorkspaces((prev) =>
      prev.map((w) => (w._id === id ? { ...w, ...patch } : w)),
    );

    const { name, description, color, icon, isPrivate } = patch;
    const apiPayload: {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      isPrivate?: boolean;
    } = {};
    if (name !== undefined) apiPayload.name = name;
    if (description !== undefined) apiPayload.description = description;
    if (color !== undefined) apiPayload.color = color;
    if (icon !== undefined) apiPayload.icon = icon;
    if (isPrivate !== undefined) apiPayload.isPrivate = isPrivate;
    if (Object.keys(apiPayload).length === 0) return;

    updateWorkspaceMutation(
      { workspaceId: id, data: apiPayload },
      {
        onSuccess: (response: any) => {
          const updated = response?.data ?? response;
          if (updated) {
            setWorkspaces((prev) =>
              prev.map((w) =>
                w._id === id ? normalizeWorkspace({ ...w, ...updated }) : w,
              ),
            );
          }
          queryClient.invalidateQueries({ queryKey: ["workspaces"] });
          queryClient.invalidateQueries({ queryKey: ["workspace", id] });
        },
        onError: () => {
          if (previous) {
            setWorkspaces((prev) =>
              prev.map((w) => (w._id === id ? previous : w)),
            );
          }
        },
      },
    );
  };

  const addActivity = (
    wsId: string,
    action: string,
    target: string,
    iconType: "project" | "member" | "role" | "workspace",
  ) => {
    const newAct = {
      id: nextId("act"),
      user: "You",
      action,
      target,
      timestamp: "Just now",
      iconType,
    };
    setWorkspaces((prev) =>
      prev.map((w) =>
        w._id === wsId
          ? { ...w, activityLog: [newAct, ...(w.activityLog || [])] }
          : w,
      ),
    );
  };

  const handleAddMember = (
    workspaceId: string,
    memberData: { userId: string; role: string },
  ) => {
    addWorkspaceMemberMutation(
      { workspaceId, data: memberData },
      {
        onSuccess: (response: any) => {
          const newMember = response?.data ?? response;
          if (newMember) {
            setWorkspaces((prev) =>
              prev.map((w) =>
                w._id === workspaceId
                  ? {
                      ...w,
                      members: [...w.members, normalizeMember(newMember)],
                    }
                  : w,
              ),
            );
            addActivity(
              workspaceId,
              "added a teammate",
              newMember?.user?.name ??
                newMember?.user?.email ??
                memberData.userId,
              "member",
            );
            addToast("success", "Teammate added successfully!");
          }
          queryClient.invalidateQueries({ queryKey: ["workspaces"] });
          queryClient.invalidateQueries({
            queryKey: ["workspace", workspaceId],
          });
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Failed to add teammate.";
          addToast("warning", message);
        },
      },
    );
  };

  const handleUpdateMemberRole = (
    workspaceId: string,
    memberId: string,
    newRole: Role,
    memberLabel: string,
  ) => {
    const previousWorkspaces = workspaces;

    setWorkspaces((prev) =>
      prev.map((w) =>
        w._id === workspaceId
          ? {
              ...w,
              members: w.members.map((m) =>
                m.user.id === memberId ? { ...m, role: newRole } : m,
              ),
            }
          : w,
      ),
    );

    updateMemberRoleMutation(
      {
        workspaceId,
        userId: memberId,
        data: { role: newRole },
      },
      {
        onSuccess: () => {
          addActivity(
            workspaceId,
            `changed role to ${newRole}`,
            memberLabel,
            "member",
          );

          addToast("info", `Updated role for ${memberLabel}`);

          queryClient.invalidateQueries({
            queryKey: ["workspaces"],
          });

          queryClient.invalidateQueries({
            queryKey: ["workspace", workspaceId],
          });
        },

        onError: () => {
          setWorkspaces(previousWorkspaces);
        },
      },
    );
  };

  const handleRemoveMember = (
    workspaceId: string,
    memberId: string,
    memberLabel: string,
  ) => {
    const previousWorkspaces = workspaces;
    removeWorkspaceMemberMutation(
      {
        workspaceId,
        userId: memberId,
      },
      {
        onSuccess: () => {
          setWorkspaces((prev) =>
            prev.map((w) =>
              w._id === workspaceId
                ? {
                    ...w,
                    members: w.members.filter((m) => m.user.id !== memberId),
                  }
                : w,
            ),
          );

          addActivity(workspaceId, "removed member", memberLabel, "member");
          addToast("warning", `Removed ${memberLabel}`);
          queryClient.invalidateQueries({
            queryKey: ["workspaces"],
          });
          queryClient.invalidateQueries({
            queryKey: ["workspace", workspaceId],
          });
        },
        onError: () => {
          setWorkspaces(previousWorkspaces);
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

  return (
    <>
      <Topbar
        title="Workspaces"
        subtitle={`${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"} · ${totals.projects} projects · ${totals.members} teammates`}
        onMenuClick={openMobileNav}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex max-w-8xl flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-80 xl:w-84">
            <div className="overflow-hidden rounded-2xl border border-[#0F2D29]/10 bg-white/90 shadow-[0_2px_12px_rgba(15,45,41,0.05)] backdrop-blur-md">
              <div className="border-b border-[#0F2D29]/6 bg-linear-to-br from-[#8FE3C4]/10 via-transparent to-[#0F2D29]/2 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8FE3C4]/25 ring-1 ring-[#8FE3C4]/40">
                      <Layers size={17} className="text-[#0F8A65]" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-bold text-[#0F2D29]">
                        Workspaces
                      </p>
                      <p className="text-[11px] text-[#5B6E68]">
                        {workspaces.length} active spaces
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F2D29] text-white shadow-sm transition hover:scale-105 hover:bg-[#0F2D29]/90 active:scale-95 focus-visible:outline-none"
                    aria-label="Create workspace"
                    title="Create workspace"
                  >
                    <Plus size={17} />
                  </button>
                </div>

                {workspaces.length > 0 && (
                  <div className="relative mt-3.5">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
                    />
                    <input
                      id="workspace-search-input"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search spaces... (Press '/' to focus)"
                      className="w-full rounded-xl border border-[#0F2D29]/10 bg-white py-2 pr-8 pl-9 text-[12.5px] text-[#0F2D29] outline-none placeholder:text-[#8FA69E] focus:border-[#8FE3C4] focus:ring-2 focus:ring-[#8FE3C4]/20 transition"
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E] hover:text-[#0F2D29]"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isLoadingWorkspaces ? (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-14">
                  <Loader2 size={20} className="animate-spin text-[#0F8A65]" />
                  <p className="text-[12px] text-[#5B6E68]">
                    Loading workspaces...
                  </p>
                </div>
              ) : isWorkspacesError ? (
                <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
                  <AlertCircle size={20} className="text-red-500" />
                  <p className="text-[12.5px] font-medium text-[#0F2D29]">
                    Couldn't load workspaces
                  </p>
                  <p className="text-[11px] text-[#8FA69E]">
                    Please refresh the page to try again.
                  </p>
                </div>
              ) : workspaces.length === 0 ? (
                <SidebarEmpty onCreate={() => setShowCreate(true)} />
              ) : (
                <ul className="max-h-[min(560px,64vh)] space-y-1.5 overflow-y-auto p-2">
                  {filtered.length === 0 ? (
                    <li className="px-3 py-10 text-center">
                      <Search
                        size={22}
                        className="mx-auto mb-2 text-[#8FA69E]/50"
                      />
                      <p className="text-[12.5px] font-medium text-[#5B6E68]">
                        No matches found
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#8FA69E]">
                        Try searching another term
                      </p>
                    </li>
                  ) : (
                    filtered.map((ws) => (
                      <WorkspaceListItem
                        key={ws._id}
                        workspace={ws}
                        active={ws._id === activeId}
                        onSelect={() => setActiveId(ws._id)}
                      />
                    ))
                  )}
                </ul>
              )}
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            {isLoadingWorkspaces ? (
              <div className="flex min-h-115 items-center justify-center rounded-2xl border border-dashed border-[#0F2D29]/15 bg-white/80">
                <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
              </div>
            ) : !activeWorkspace ? (
              <EmptyPanel onCreate={() => setShowCreate(true)} />
            ) : isLoadingActiveWorkspace ? (
              <div className="flex min-h-115 items-center justify-center rounded-2xl border border-dashed border-[#0F2D29]/15 bg-white/80">
                <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
              </div>
            ) : isActiveWorkspaceError ? (
              <div className="flex min-h-115 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0F2D29]/15 bg-white/80 text-center">
                <AlertCircle size={22} className="text-red-500" />
                <p className="text-[13.5px] font-medium text-[#0F2D29]">
                  Couldn't load this workspace
                </p>
                <p className="text-[12px] text-[#8FA69E]">
                  Please try selecting it again.
                </p>
              </div>
            ) : (
              <WorkspaceDetail
                key={activeWorkspace._id}
                workspace={activeWorkspace}
                isRefreshing={isFetchingActiveWorkspace || isUpdatingWorkspace}
                isDeleting={
                  isDeletingWorkspace && deletingId === activeWorkspace._id
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
                  handleRemoveMember(activeWorkspace._id, memberId, memberLabel)
                }
                isRemovingMember={isRemovingMember}
                users={users}
                isLoadingUsers={isLoadingUsers}
                addActivity={(action, target, iconType) =>
                  addActivity(activeWorkspace._id, action, target, iconType)
                }
                addToast={addToast}
                onUpdateMemberRole={(memberId, newRole, memberLabel) =>
                  handleUpdateMemberRole(
                    activeWorkspace._id,
                    memberId,
                    newRole,
                    memberLabel,
                  )
                }
                isUpdatingMemberRole={isUpdatingMemberRole}
              />
            )}
          </section>
        </div>
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

      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29] px-4 py-3 text-[13px] font-medium text-white shadow-xl backdrop-blur-md"
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

const SidebarEmpty = ({ onCreate }: { onCreate: () => void }) => (
  <div className="px-4 py-10 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8FE3C4]/20">
      <Building2 size={22} className="text-[#0F8A65]" />
    </div>
    <p className="text-[13.5px] font-bold text-[#0F2D29]">No workspaces yet</p>
    <p className="mt-1 text-[12px] text-[#5B6E68]">
      Create your first space to organize projects and teammates.
    </p>
    <button
      onClick={onCreate}
      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-medium text-white shadow-sm transition hover:bg-[#0F2D29]/90"
    >
      <Plus size={14} />
      Create workspace
    </button>
  </div>
);

const EmptyPanel = ({ onCreate }: { onCreate: () => void }) => (
  <div className="relative flex min-h-115 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#0F2D29]/15 bg-white/80 px-6 py-16 text-center shadow-xs">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(143,227,196,0.15),transparent_60%)]" />
    <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8FE3C4]/20 ring-1 ring-[#8FE3C4]/40">
      <Building2 size={28} className="text-[#0F8A65]" />
    </div>
    <h2 className="relative text-[18px] font-bold tracking-tight text-[#0F2D29]">
      Select a Workspace
    </h2>
    <p className="relative mt-2 max-w-sm text-[13px] leading-relaxed text-[#5B6E68]">
      Choose a workspace from the sidebar to manage projects, teammates, custom
      roles, and activity logs — or create a brand new space.
    </p>
    <button
      onClick={onCreate}
      className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F2D29] px-5 py-2.5 text-[13px] font-medium text-white shadow-md transition hover:bg-[#0F2D29]/90 hover:shadow-lg"
    >
      <Sparkles size={15} />
      Create workspace
    </button>
  </div>
);

export default Workspaces;
