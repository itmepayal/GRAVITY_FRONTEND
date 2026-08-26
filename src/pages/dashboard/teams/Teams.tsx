import { useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import {
  TeamMetricsBanner,
  TeamFilterBar,
  TeamGridView,
  TeamTableView,
  TeamKanbanView,
  TeamDetailDrawer,
  TeamLoadingSkeleton,
  TeamEmptyState,
  CreateTeamModal,
  EditTeamModal,
  AddMemberModal,
  ChangeLeadModal,
  DeleteTeamModal,
} from "@/components/team";
import { useTeamsState } from "@/hooks/useTeamsState";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function Teams() {
  const { openMobileNav } = useDashboardContext();

  const {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    searchQuery,
    setSearchQuery,
    sizeFilter,
    setSizeFilter,
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
    isTeamsError,
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
    workspaces.find((w: { id: string; name: string }) => w.id === selectedWorkspaceId)?.name ?? "Workspace";

  const hasActiveFilters = Boolean(
    searchQuery.trim() || sizeFilter !== "all",
  );

  return (
    <>
      <Topbar
        variant="light"
        title="Teams"
        subtitle={`${activeWorkspaceName} · ${metrics.totalTeams} team${metrics.totalTeams === 1 ? "" : "s"} · ${metrics.totalMembers} members`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <TeamMetricsBanner
          totalTeams={metrics.totalTeams}
          totalMembers={metrics.totalMembers}
          totalLeads={metrics.totalLeads}
          totalWorkspaces={metrics.totalWorkspaces}
        />

        <TeamFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          onWorkspaceSelect={setSelectedWorkspaceId}
          sizeFilter={sizeFilter}
          onSizeFilterChange={setSizeFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenCreate={() => setShowCreateModal(true)}
          isLoadingWorkspaces={isLoadingWorkspaces}
          teamCount={teams.length}
        />

        {isLoadingTeams ? (
          <TeamLoadingSkeleton viewMode={viewMode} />
        ) : isTeamsError ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3 border border-dashed border-[#F3B8B4] bg-[#FBEAE9] p-8 text-center">
            <AlertTriangle size={22} className="text-[#B3261E]" />
            <p className="text-sm font-bold text-[#B3261E]">
              Failed to load teams for this workspace.
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
        ) : teams.length === 0 ? (
          <TeamEmptyState
            hasActiveFilters={hasActiveFilters}
            onCreateTeam={() => setShowCreateModal(true)}
          />
        ) : (
          <>
            {viewMode === "grid" && (
              <TeamGridView
                teams={teams}
                activeTeamId={selectedTeam?.id ?? null}
                onSelectTeam={(t) => setSelectedTeamId(t.id)}
                onOpenCreate={() => setShowCreateModal(true)}
                onOpenAddMember={(t) => setAddingMemberTeam(t)}
                onOpenEdit={(t) => setEditingTeam(t)}
                onOpenDelete={(t) => setDeletingTeam(t)}
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
              />
            )}

            {viewMode === "kanban" && (
              <TeamKanbanView
                teams={teams}
                activeTeamId={selectedTeam?.id ?? null}
                onSelectTeam={(t) => setSelectedTeamId(t.id)}
                onOpenCreate={() => setShowCreateModal(true)}
                onOpenAddMember={(t) => setAddingMemberTeam(t)}
                onOpenEdit={(t) => setEditingTeam(t)}
                onOpenDelete={(t) => setDeletingTeam(t)}
              />
            )}
          </>
        )}
      </main>

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
