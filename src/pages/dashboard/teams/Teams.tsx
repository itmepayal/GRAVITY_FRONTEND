import { useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import {
  TeamMetricsBanner,
  TeamFilterBar,
  TeamGridView,
  TeamTableView,
  TeamDetailDrawer,
  CreateTeamModal,
  EditTeamModal,
  AddMemberModal,
  ChangeLeadModal,
  DeleteTeamModal,
} from "@/components/team";
import { useTeamsState } from "@/hooks/useTeamsState";

export function Teams() {
  const { openMobileNav } = useDashboardContext();

  const {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    teams,
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
    isCreatingTeam,
    isUpdatingTeam,
    isDeletingTeam,
    isAddingMember,
    isChangingLead,
    handleCreateTeam,
    handleUpdateTeam,
    handleDeleteTeam,
    handleAddMember,
    handleRemoveMember,
    handleChangeLead,
  } = useTeamsState();

  // Keyboard shortcut listener for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        document.getElementById("team-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeWorkspaceName =
    workspaces.find((w) => w.id === selectedWorkspaceId)?.name ?? "Workspace";

  return (
    <>
      <Topbar
        variant="light"
        title="Teams"
        subtitle={`${activeWorkspaceName} · ${metrics.totalTeams} team${metrics.totalTeams === 1 ? "" : "s"
          } · ${metrics.totalMembers} members`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Metrics Banner */}
        <TeamMetricsBanner
          totalTeams={metrics.totalTeams}
          totalMembers={metrics.totalMembers}
          totalLeads={metrics.totalLeads}
          totalWorkspaces={metrics.totalWorkspaces}
        />

        {/* Filter & Controls Bar */}
        <TeamFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          onWorkspaceSelect={setSelectedWorkspaceId}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenCreate={() => setShowCreateModal(true)}
          isLoadingWorkspaces={isLoadingWorkspaces}
        />

        {/* Teams View (Grid or Table) */}
        {viewMode === "grid" && (
          <TeamGridView
            teams={teams}
            activeTeamId={selectedTeam?.id ?? null}
            onSelectTeam={(t) => setSelectedTeamId(t.id)}
            onOpenCreate={() => setShowCreateModal(true)}
            onOpenAddMember={(t) => setAddingMemberTeam(t)}
            onOpenEdit={(t) => setEditingTeam(t)}
            onOpenDelete={(t) => setDeletingTeam(t)}
            isLoading={isLoadingTeams}
          />
        )}

        {viewMode === "table" && (
          <TeamTableView
            teams={teams}
            activeTeamId={selectedTeam?.id ?? null}
            onSelectTeam={(t) => setSelectedTeamId(t.id)}
            onOpenCreate={() => setShowCreateModal(true)}
            onOpenAddMember={(t) => setAddingMemberTeam(t)}
            onOpenEdit={(t) => setEditingTeam(t)}
            onOpenDelete={(t) => setDeletingTeam(t)}
            isLoading={isLoadingTeams}
          />
        )}
      </main>

      {/* Slide-over Detail Drawer */}
      {selectedTeam && (
        <TeamDetailDrawer
          team={selectedTeam}
          onClose={() => setSelectedTeamId(null)}
          onOpenAddMember={() => setAddingMemberTeam(selectedTeam)}
          onOpenChangeLead={() => setChangingLeadTeam(selectedTeam)}
          onRemoveMember={(userId) => handleRemoveMember(selectedTeam.id, userId)}
          onOpenEdit={() => setEditingTeam(selectedTeam)}
          onOpenDelete={() => setDeletingTeam(selectedTeam)}
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          availableUsers={availableUsers}
          onSubmit={handleCreateTeam}
          isSubmitting={isCreatingTeam}
        />
      )}

      {editingTeam && (
        <EditTeamModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSubmit={handleUpdateTeam}
          isSubmitting={isUpdatingTeam}
        />
      )}

      {addingMemberTeam && (
        <AddMemberModal
          team={addingMemberTeam}
          availableUsers={availableUsers}
          onClose={() => setAddingMemberTeam(null)}
          onAdd={handleAddMember}
          isSubmitting={isAddingMember}
        />
      )}

      {changingLeadTeam && (
        <ChangeLeadModal
          team={changingLeadTeam}
          availableUsers={availableUsers}
          onClose={() => setChangingLeadTeam(null)}
          onChangeLead={handleChangeLead}
          isSubmitting={isChangingLead}
        />
      )}

      {deletingTeam && (
        <DeleteTeamModal
          teamName={deletingTeam.name}
          onClose={() => setDeletingTeam(null)}
          onConfirm={handleDeleteTeam}
          isSubmitting={isDeletingTeam}
        />
      )}
    </>
  );
}

export default Teams;
