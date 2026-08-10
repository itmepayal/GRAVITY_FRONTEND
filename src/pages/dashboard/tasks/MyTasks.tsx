import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import {
  TaskMetricsBanner,
  TaskFilterBar,
  TaskKanbanView,
  TaskTableView,
  TaskGridView,
  CreateTaskModal,
  TaskDetailDrawer,
} from "@/components/task";
import { useTasksState } from "@/hooks/useTasksState";

const MyTask = () => {
  const { openMobileNav } = useDashboardContext();
  const {
    filteredTasks,
    metrics,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    selectedProjectId,
    setSelectedProjectId,
    selectedBoardId,
    setSelectedBoardId,
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    activeBoardColumns,
    filteredProjects,
    filteredBoards,
    workspaces,
    sprints,
    users,
    currentMember,
    setSelectedTaskId,
    activeTask,
    createModalOpen,
    setCreateModalOpen,
    createModalColumn,
    setCreateModalColumn,
    handleDropTaskToColumn,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
  } = useTasksState();
  return (
    <>
      <Topbar
        variant="light"
        title="My Tasks"
        subtitle={
          filteredTasks.length === 0
            ? "No tasks match active filters."
            : `${filteredTasks.length} active task${filteredTasks.length === 1 ? "" : "s"} across workspaces`
        }
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <TaskMetricsBanner metrics={metrics} />

        <TaskFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedWorkspaceId={selectedWorkspaceId}
          onWorkspaceChange={(id) => {
            setSelectedWorkspaceId(id);
            setSelectedProjectId("all");
            setSelectedBoardId("all");
          }}
          selectedProjectId={selectedProjectId}
          onProjectChange={(id) => {
            setSelectedProjectId(id);
            setSelectedBoardId("all");
          }}
          selectedBoardId={selectedBoardId}
          onBoardChange={setSelectedBoardId}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          workspaces={workspaces}
          projects={filteredProjects}
          boards={filteredBoards}
          onOpenCreateModal={(col) => {
            setCreateModalColumn(col || "To Do");
            setCreateModalOpen(true);
          }}
        />

        {viewMode === "kanban" && (
          <TaskKanbanView
            columns={activeBoardColumns}
            tasks={filteredTasks}
            onOpenTask={(id) => setSelectedTaskId(id)}
            onOpenCreateModal={(col) => {
              setCreateModalColumn(col);
              setCreateModalOpen(true);
            }}
            onDropTaskToColumn={handleDropTaskToColumn}
          />
        )}

        {viewMode === "table" && (
          <TaskTableView
            tasks={filteredTasks}
            onOpenTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {viewMode === "grid" && (
          <TaskGridView
            tasks={filteredTasks}
            onOpenTask={(id) => setSelectedTaskId(id)}
          />
        )}
      </main>

      {createModalOpen && (
        <CreateTaskModal
          defaultColumn={createModalColumn}
          workspaces={workspaces}
          projects={filteredProjects}
          boards={filteredBoards}
          sprints={sprints}
          users={users}
          currentMember={currentMember}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateTask}
        />
      )}

      {activeTask && (
        <TaskDetailDrawer
          task={activeTask}
          currentMember={currentMember}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </>
  );
};

export default MyTask;
