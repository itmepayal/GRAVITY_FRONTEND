import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  type NormalizedTeam,
  type NormalizedUser,
  type TeamViewMode,
  type TeamSizeFilter,
  getTeamSizeCategory,
  normalizeTeamData,
} from "@/components/team/types";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceById } from "@/hooks/queries/workspace/use-get-workspace-by-id";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";
import { useGetWorkspaceTeams } from "@/hooks/queries/team/use-get-workspace-teams";
import { useCreateTeam } from "@/hooks/mutations/team/use-create-team";
import { useUpdateTeam } from "@/hooks/mutations/team/use-update-team";
import { useDeleteTeam } from "@/hooks/mutations/team/use-delete-team";
import { useAddTeamMember } from "@/hooks/mutations/team/use-add-team-member";
import { useRemoveTeamMember } from "@/hooks/mutations/team/use-remove-team-member";
import { useChangeTeamLead } from "@/hooks/mutations/team/use-change-team-lead";

export function useTeamsState() {
  const queryClient = useQueryClient();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<TeamViewMode>("grid");
  const [sizeFilter, setSizeFilter] = useState<TeamSizeFilter>("all");

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<NormalizedTeam | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<NormalizedTeam | null>(null);
  const [addingMemberTeam, setAddingMemberTeam] = useState<NormalizedTeam | null>(null);
  const [changingLeadTeam, setChangingLeadTeam] = useState<NormalizedTeam | null>(null);

  const { data: workspacesResponse, isLoading: isLoadingWorkspaces } =
    useGetUserWorkspaces();

  const workspaces = useMemo(() => {
    const raw = Array.isArray(workspacesResponse)
      ? workspacesResponse
      : (workspacesResponse?.data ?? []);
    return raw.map((w: any) => ({
      id: w._id ?? w.id,
      name: w.name ?? "Untitled Workspace",
    }));
  }, [workspacesResponse]);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  const activeWorkspaceId = selectedWorkspaceId || (workspaces[0]?.id ?? "");

  const { data: teamsResponse, isLoading: isLoadingTeams, isError: isTeamsError } =
    useGetWorkspaceTeams(activeWorkspaceId);

  const { data: workspaceDetailResponse } = useGetWorkspaceById(
    activeWorkspaceId || undefined,
  );
  const { data: allUsersResponse } = useGetAllUsers();

  const availableUsers: NormalizedUser[] = useMemo(() => {
    const wsMembers = workspaceDetailResponse?.data?.members ?? workspaceDetailResponse?.members ?? [];
    const allUsers = allUsersResponse || [];

    if (wsMembers.length > 0) {
      return wsMembers.map((m: any) => {
        const u = m.user || {};
        const id = u._id || u.id || "u-" + Math.random();
        const name = u.name || "Workspace Member";
        const email = u.email || "";
        const avatar = u.avatar || undefined;
        const initials = name
          .split(/\s+/)
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return {
          id,
          name,
          email,
          avatar,
          initials,
          color: "#0F2D29",
        };
      });
    }

    if (allUsers.length > 0) {
      return allUsers.map((u: any) => ({
        id: u._id || u.id,
        name: u.name || "User",
        email: u.email || "",
        avatar: u.avatar || undefined,
        initials: (u.name || "U").slice(0, 2).toUpperCase(),
        color: "#0F2D29",
      }));
    }

    // Default mock users fallback with brand sidebar colors
    return [
      { id: "u1", name: "Aarav Shah", email: "aarav@acme.com", initials: "AS", color: "#8FE3C4" },
      { id: "u2", name: "Priya Nair", email: "priya@acme.com", initials: "PN", color: "#5EC9A6" },
      { id: "u3", name: "Rohan Mehta", email: "rohan@acme.com", initials: "RM", color: "#2F8F74" },
      { id: "u4", name: "Isha Kapoor", email: "isha@acme.com", initials: "IK", color: "#0F2D29" },
      { id: "u5", name: "Dev Patel", email: "dev@acme.com", initials: "DP", color: "#6FBFA0" },
      { id: "u6", name: "Ananya Rao", email: "ananya@acme.com", initials: "AR", color: "#8FE3C4" },
    ];
  }, [workspaceDetailResponse, allUsersResponse]);

  // Normalize Teams
  const teams: NormalizedTeam[] = useMemo(() => {
    const raw = Array.isArray(teamsResponse)
      ? teamsResponse
      : (teamsResponse?.data ?? []);

    if (raw.length > 0) {
      return raw.map(normalizeTeamData);
    }

    return [];
  }, [teamsResponse]);

  const selectedTeam = useMemo(() => {
    if (!selectedTeamId) return null;
    return teams.find((t) => t.id === selectedTeamId) ?? null;
  }, [teams, selectedTeamId]);

  const filteredTeams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return teams.filter((t) => {
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.lead.name.toLowerCase().includes(q);

      const matchesSize =
        sizeFilter === "all" ||
        getTeamSizeCategory(t.members.length) === sizeFilter;

      return matchesSearch && matchesSize;
    });
  }, [teams, searchQuery, sizeFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const totalTeams = teams.length;
    const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0);
    const uniqueLeads = new Set(teams.map((t) => t.lead.id)).size;
    const totalWorkspaces = workspaces.length || 1;

    return {
      totalTeams,
      totalMembers,
      totalLeads: uniqueLeads,
      totalWorkspaces,
    };
  }, [teams, workspaces]);

  // Mutations
  const { mutate: createTeamMutation, isPending: isCreatingTeam } =
    useCreateTeam();
  const { mutate: updateTeamMutation, isPending: isUpdatingTeam } =
    useUpdateTeam();
  const { mutate: deleteTeamMutation, isPending: isDeletingTeam } =
    useDeleteTeam();
  const { mutate: addMemberMutation, isPending: isAddingMember } =
    useAddTeamMember();
  const { mutate: removeMemberMutation, isPending: isRemovingMember } =
    useRemoveTeamMember();
  const { mutate: changeLeadMutation, isPending: isChangingLead } =
    useChangeTeamLead();

  // Handlers
  const handleCreateTeam = (data: {
    name: string;
    description: string;
    color: string;
    leadId: string;
  }) => {
    if (!activeWorkspaceId) return;

    createTeamMutation(
      {
        workspaceId: activeWorkspaceId,
        data: {
          name: data.name,
          description: data.description,
          color: data.color,
          lead: data.leadId,
        },
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          queryClient.invalidateQueries({
            queryKey: ["workspace-teams", activeWorkspaceId],
          });
        },
      },
    );
  };

  const handleUpdateTeam = (data: {
    name: string;
    description: string;
    color: string;
  }) => {
    if (!editingTeam) return;

    updateTeamMutation(
      {
        teamId: editingTeam.id,
        data: {
          name: data.name,
          description: data.description,
          color: data.color,
        },
      },
      {
        onSuccess: () => {
          setEditingTeam(null);
          queryClient.invalidateQueries({
            queryKey: ["workspace-teams", activeWorkspaceId],
          });
        },
      },
    );
  };

  const handleDeleteTeam = () => {
    if (!deletingTeam) return;

    deleteTeamMutation(deletingTeam.id, {
      onSuccess: () => {
        if (selectedTeamId === deletingTeam.id) {
          setSelectedTeamId(null);
        }
        setDeletingTeam(null);
        queryClient.invalidateQueries({
          queryKey: ["workspace-teams", activeWorkspaceId],
        });
      },
    });
  };

  const handleAddMember = (userId: string) => {
    if (!addingMemberTeam) return;

    addMemberMutation(
      {
        teamId: addingMemberTeam.id,
        data: { userId },
      },
      {
        onSuccess: () => {
          setAddingMemberTeam(null);
          queryClient.invalidateQueries({
            queryKey: ["workspace-teams", activeWorkspaceId],
          });
        },
      },
    );
  };

  const handleRemoveMember = (teamId: string, userId: string) => {
    removeMemberMutation(
      {
        teamId,
        userId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["workspace-teams", activeWorkspaceId],
          });
        },
      },
    );
  };

  const handleChangeLead = (userId: string) => {
    if (!changingLeadTeam) return;

    changeLeadMutation(
      {
        teamId: changingLeadTeam.id,
        data: { userId, leadId: userId },
      },
      {
        onSuccess: () => {
          setChangingLeadTeam(null);
          queryClient.invalidateQueries({
            queryKey: ["workspace-teams", activeWorkspaceId],
          });
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
    sizeFilter,
    setSizeFilter,
    viewMode,
    setViewMode,
    teams: filteredTeams,
    rawTeams: teams,
    metrics,
    selectedTeam,
    setSelectedTeamId,
    showCreateModal,
    setShowCreateModal,
    editingTeam,
    setEditingTeam,
    deletingTeam,
    setDeletingTeam,
    addingMemberTeam,
    setAddingMemberTeam,
    changingLeadTeam,
    setChangingLeadTeam,
    availableUsers,
    isLoadingWorkspaces,
    isLoadingTeams,
    isTeamsError,
    isCreatingTeam,
    isUpdatingTeam,
    isDeletingTeam,
    isAddingMember,
    isRemovingMember,
    isChangingLead,
    handleCreateTeam,
    handleUpdateTeam,
    handleDeleteTeam,
    handleAddMember,
    handleRemoveMember,
    handleChangeLead,
  };
}
