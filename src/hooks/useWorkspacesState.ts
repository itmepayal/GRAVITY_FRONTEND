import { useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  type Workspace,
  type Member,
  type Toast,
  type Role,
  type WorkspaceViewMode,
  type VisibilityFilter,
  type RoleFilter,
  nextId,
} from "@/components/workspace";
import { useCreateWorkspace } from "@/hooks/mutations/workspace/use-create-workspace";
import { useUpdateWorkspace } from "@/hooks/mutations/workspace/use-update-workspace";
import { useDeleteWorkspace } from "@/hooks/mutations/workspace/use-delete-workspace";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceById } from "@/hooks/queries/workspace/use-get-workspace-by-id";
import { useAddWorkspaceMember } from "@/hooks/mutations/workspace/use-add-workspace-member";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";
import { useRemoveWorkspaceMember } from "@/hooks/mutations/workspace/use-remove-workspace-member";
import { useUpdateWorkspaceMemberRole } from "@/hooks/mutations/workspace/use-update-workspace-member-role";
import { useGetWorkspaceGoals } from "@/hooks/queries/goal/get-workspace-goals";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useState } from "react";

export const normalizeMember = (raw: any): Member & { _id: string } => ({
  _id: raw._id ?? nextId("m"),
  user: {
    id: raw?.user?._id ?? raw?.user?.id ?? nextId("u"),
    name: raw?.user?.name ?? raw?.name ?? "Unknown",
    email: raw?.user?.email ?? raw?.email ?? "",
    avatar: raw?.user?.avatar ?? raw?.avatar ?? null,
  },
  role: raw.role ?? "member",
  joinedAt: raw.joinedAt ?? raw.createdAt ?? new Date().toISOString(),
});

export const normalizeUser = (raw: any) => ({
  id: raw._id ?? raw.id,
  name: raw.name ?? raw.email ?? "Unknown",
  email: raw.email ?? "",
  avatar: raw.avatar ?? null,
});

export const normalizeWorkspace = (raw: any): Workspace => ({
  ...raw,
  _id: raw._id ?? raw.id,
  role: raw.role ?? "member",
  projects: raw.projects ?? [],
  members: (raw.members ?? []).map(normalizeMember),
  roles: raw.roles ?? [],
  activityLog: raw.activityLog ?? [],
});

export function useWorkspacesState() {
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
    const raw = Array.isArray(usersResponse) ? usersResponse : [];
    return raw.map(normalizeUser);
  }, [usersResponse]);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspaceStore();
  const activeId = currentWorkspaceId;
  const setActiveId = setCurrentWorkspaceId;

  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"workspace" | "goals">(
    "workspace",
  );
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>("grid");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const {
    data: activeWorkspaceResponse,
    isLoading: isLoadingActiveWorkspace,
    isFetching: isFetchingActiveWorkspace,
    isError: isActiveWorkspaceError,
  } = useGetWorkspaceById(activeId ?? "");

  const { data: activeGoalsData } = useGetWorkspaceGoals(activeId ?? "");
  const totalGoalsCount = useMemo(() => {
    const res: any = activeGoalsData;
    const raw = Array.isArray(res) ? res : (res?.goals ?? res?.data ?? []);
    return raw.length;
  }, [activeGoalsData]);

  useEffect(() => {
    const raw = Array.isArray(workspacesResponse)
      ? workspacesResponse
      : (workspacesResponse?.data ?? []);
    const normalized = raw.map(normalizeWorkspace);
    setWorkspaces(normalized);
    const isValidSelection = normalized.some(
      (w: Workspace) => w._id === activeId,
    );
    if (!activeId || !isValidSelection) {
      setActiveId(normalized[0]?._id ?? "");
    }
  }, [workspacesResponse]);

  useEffect(() => {
    if (!activeWorkspaceResponse) return;
    const raw = activeWorkspaceResponse?.data ?? activeWorkspaceResponse;
    const normalized = normalizeWorkspace(raw);

    setWorkspaces((prev) =>
      prev.map((w: Workspace) =>
        w._id === normalized._id ? { ...w, ...normalized } : w,
      ),
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
  const canManageActiveWorkspace =
    activeWorkspace?.role === "owner" || activeWorkspace?.role === "admin";

  const totals = useMemo(
    () => ({
      projects: workspaces.reduce((n, w) => n + (w.projects?.length ?? 0), 0),
      members: workspaces.reduce((n, w) => n + (w.members?.length ?? 0), 0),
    }),
    [workspaces],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workspaces.filter((w) => {
      const matchesSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.description?.toLowerCase().includes(q);

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "private" ? w.isPrivate : !w.isPrivate);

      const normalizedRole = (w.role || "member").toLowerCase() as Role;
      const matchesRole =
        roleFilter === "all" || normalizedRole === roleFilter;

      return matchesSearch && matchesVisibility && matchesRole;
    });
  }, [workspaces, query, visibilityFilter, roleFilter]);

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
        if (activeId === id) {
          const remaining = workspaces.filter((w) => w._id !== id);
          setActiveId(remaining[0]?._id ?? "");
        }
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
    const apiPayload: any = {};
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
          ? {
              ...w,
              activityLog: [newAct, ...(w.activityLog ?? [])],
            }
          : w,
      ),
    );
  };

  const handleAddMember = (
    workspaceId: string,
    memberData: { email: string; roleId: string },
  ) => {
    addWorkspaceMemberMutation(
      { workspaceId, data: memberData },
      {
        onSuccess: (response: any) => {
          addActivity(
            workspaceId,
            "sent an invitation to",
            memberData.email,
            "member",
          );
          addToast(
            "success",
            response?.message ?? "Invitation sent successfully!",
          );
          queryClient.invalidateQueries({ queryKey: ["workspaces"] });
          queryClient.invalidateQueries({
            queryKey: ["workspace", workspaceId],
          });
          queryClient.invalidateQueries({
            queryKey: ["workspace-invitations", workspaceId],
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
    newRoleId: string,
    memberLabel: string,
  ) => {
    const previousWorkspaces = workspaces;
    setWorkspaces((prev) =>
      prev.map((w) =>
        w._id === workspaceId
          ? {
              ...w,
              members: w.members.map((m) =>
                m.user.id === memberId ? { ...m, role: newRoleId as Role } : m,
              ),
            }
          : w,
      ),
    );

    updateMemberRoleMutation(
      {
        workspaceId,
        userId: memberId,
        data: { roleId: newRoleId },
      },
      {
        onSuccess: () => {
          addActivity(workspaceId, `changed role`, memberLabel, "member");
          addToast("info", `Updated role for ${memberLabel}`);
          queryClient.invalidateQueries({ queryKey: ["workspaces"] });
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
          queryClient.invalidateQueries({ queryKey: ["workspaces"] });
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

  return {
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
  };
}
