import { useState, useMemo } from "react";
import { useSyncedWorkspace } from "@/hooks/useSyncedWorkspace";
import { useGetWorkspaceRoles } from "@/hooks/queries/role/use-get-workspace-roles";
import { useGetAllPermissions } from "@/hooks/queries/role/use-get-all-permissions";
import { useCreateWorkspaceRole } from "@/hooks/mutations/role/use-create-role";
import { useUpdateWorkspaceRole } from "@/hooks/mutations/role/use-update-role";
import { useDeleteWorkspaceRole } from "@/hooks/mutations/role/use-delete-role";

export interface RoleItem {
  id: string;
  _id?: string;
  name: string;
  workspace: string | null;
  permissions: string[];
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function useRolesState() {
  const {
    workspaces: syncedWorkspaces,
    currentWorkspaceId: selectedWorkspaceId,
    setCurrentWorkspaceId: setSelectedWorkspaceId,
    isLoadingWorkspaces,
  } = useSyncedWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleItem | null>(null);

  const workspaces = useMemo(
    () =>
      syncedWorkspaces.map((workspace: any) => ({
        id: workspace.id ?? workspace._id,
        name: workspace.name ?? "Untitled Workspace",
      })),
    [syncedWorkspaces],
  );

  const activeWorkspaceId = selectedWorkspaceId || (workspaces[0]?.id ?? "");

  // 2. Fetch Roles & Available Permissions
  const {
    data: rolesResponse,
    isLoading: isLoadingRoles,
    isError: isRolesError,
  } = useGetWorkspaceRoles(activeWorkspaceId);

  const { data: allPermissionsResponse, isLoading: isLoadingPermissions } =
    useGetAllPermissions();

  const roles: RoleItem[] = useMemo(() => {
    const raw = Array.isArray(rolesResponse)
      ? rolesResponse
      : rolesResponse?.data ?? [];
    return raw.map((r: any) => ({
      id: r._id ?? r.id,
      name: r.name,
      workspace: r.workspace,
      permissions: r.permissions || [],
      isSystem: !!r.isSystem,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }, [rolesResponse]);

  const availablePermissions: string[] = useMemo(() => {
    if (Array.isArray(allPermissionsResponse)) return allPermissionsResponse;
    return allPermissionsResponse?.data ?? [];
  }, [allPermissionsResponse]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => r.name.toLowerCase().includes(q));
  }, [roles, searchQuery]);

  // 3. Mutations
  const { mutate: createRoleMutation, isPending: isCreatingRole } =
    useCreateWorkspaceRole();

  const { mutate: updateRoleMutation, isPending: isUpdatingRole } =
    useUpdateWorkspaceRole();

  const { mutate: deleteRoleMutation, isPending: isDeletingRole } =
    useDeleteWorkspaceRole();

  // Handlers
  const handleCreateRole = (data: { name: string; permissions: string[] }) => {
    if (!activeWorkspaceId) return;

    createRoleMutation(
      {
        workspaceId: activeWorkspaceId,
        data,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
        },
      },
    );
  };

  const handleUpdateRole = (data: { name?: string; permissions?: string[] }) => {
    if (!activeWorkspaceId || !editingRole) return;

    updateRoleMutation(
      {
        workspaceId: activeWorkspaceId,
        roleId: editingRole.id,
        data,
      },
      {
        onSuccess: () => {
          setEditingRole(null);
        },
      },
    );
  };

  const handleDeleteRole = () => {
    if (!activeWorkspaceId || !deletingRole) return;

    deleteRoleMutation(
      {
        workspaceId: activeWorkspaceId,
        roleId: deletingRole.id,
      },
      {
        onSuccess: () => {
          if (selectedRole?.id === deletingRole.id) {
            setSelectedRole(null);
          }
          setDeletingRole(null);
        },
      },
    );
  };

  return {
    workspaces,
    selectedWorkspaceId: activeWorkspaceId,
    setSelectedWorkspaceId,
    searchQuery,
    setSearchQuery,
    roles: filteredRoles,
    allRoles: roles,
    selectedRole,
    setSelectedRole,
    availablePermissions,
    // Modals
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingRole,
    setEditingRole,
    deletingRole,
    setDeletingRole,
    // Loading & Pending States
    isLoadingWorkspaces,
    isLoadingRoles,
    isLoadingPermissions,
    isRolesError,
    isCreatingRole,
    isUpdatingRole,
    isDeletingRole,
    // Actions
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
  };
}
