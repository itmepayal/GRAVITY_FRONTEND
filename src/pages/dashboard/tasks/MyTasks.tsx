import { useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import {
  TaskMetricsBanner,
  TaskFilterBar,
  TaskKanbanView,
  TaskTableView,
  TaskGridView,
  CreateTaskModal,
} from "@/components/task";
import { TaskDetailModal } from "@/components/task/TaskDetailModal";
import { TaskLoadingSkeleton } from "@/components/task/TaskLoadingSkeleton";
import { TaskEmptyState } from "@/components/task/TaskEmptyState";
import { useTasksState } from "@/hooks/useTasksState";
import { useSyncedWorkspace } from "@/hooks/useSyncedWorkspace";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useGetProjectBoards } from "@/hooks/queries/project/use-get-project-boards";
import { useGetAllUserBoards } from "@/hooks/queries/board/use-get-all-user-boards";
import { useGetBoardTasks } from "@/hooks/queries/task/use-get-board-tasks";
import { useGetMyTasks } from "@/hooks/queries/task/use-get-my-Tasks";
import { useUpdateTask } from "@/hooks/mutations/task/use-update-task";
import { useQueryClient } from "@tanstack/react-query";
import type { BoardType } from "@/pages/dashboard/board/type";
import type { IWorkspace, IProject, IBoard, ITask } from "@/types/task";
import { columnToStatus } from "@/types/task";

const unwrap = (response: any, fallback: any[] = []) =>
  response?.data ?? response ?? fallback;

const normalizeId = <T extends { _id?: string; id?: string }>(
  items: T[],
): (T & { id: string })[] =>
  (items ?? []).map((item) => ({ ...item, id: item.id ?? item._id ?? "" }));

const normalizeCol = (s: string) =>
  (s ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-_]+/g, "");

const MyTask = () => {
  const { openMobileNav } = useDashboardContext();
  const queryClient = useQueryClient();

  const {
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
    selectedTaskId,
    setSelectedTaskId,
    createModalOpen,
    setCreateModalOpen,
    createModalColumn,
    setCreateModalColumn,
    handleCreateTask,
  } = useTasksState();

  const isSpecificWorkspaceSelected =
    !!selectedWorkspaceId && selectedWorkspaceId !== "all";
  const isSpecificProjectSelected =
    !!selectedProjectId && selectedProjectId !== "all";
  const isSpecificBoardSelected =
    !!selectedBoardId && selectedBoardId !== "all";

  const {
    workspaces: syncedWorkspaces,
    setCurrentWorkspaceId,
    isLoadingWorkspaces: isWorkspacesLoading,
  } = useSyncedWorkspace({ allowAll: true });
  const workspaces: IWorkspace[] = normalizeId<IWorkspace>(syncedWorkspaces);

  const { data: projectsResponse, isLoading: isProjectsLoading } =
    useGetWorkspaceProjects(
      isSpecificWorkspaceSelected ? selectedWorkspaceId : "",
    );
  const projects: IProject[] = isSpecificWorkspaceSelected
    ? normalizeId<IProject>(unwrap(projectsResponse))
    : [];

  const { data: projectBoardsResponse, isLoading: isProjectBoardsLoading } =
    useGetProjectBoards(isSpecificProjectSelected ? selectedProjectId : "");

  const { data: allBoardsResponse, isLoading: isAllBoardsLoading } =
    useGetAllUserBoards();

  const boards: IBoard[] = isSpecificProjectSelected
    ? normalizeId<IBoard>(unwrap(projectBoardsResponse))
    : normalizeId<IBoard>(unwrap(allBoardsResponse));
  const isBoardsLoading = isSpecificProjectSelected
    ? isProjectBoardsLoading
    : isAllBoardsLoading;

  const activeBoard = boards.find((b) => b.id === selectedBoardId) ?? boards[0];

  const activeBoardId: string = activeBoard?.id ?? "";
  const activeBoardType: BoardType = (activeBoard as any)?.type ?? "kanban";

  const {
    data: boardTasksResponse,
    isLoading: isBoardTasksLoading,
    isError: isBoardTasksError,
  } = useGetBoardTasks(isSpecificBoardSelected ? activeBoardId : "");

  const boardTasks: ITask[] = normalizeId<ITask>(unwrap(boardTasksResponse));

  const {
    data: myTasksResponse,
    isLoading: isMyTasksLoading,
    isError: isMyTasksError,
  } = useGetMyTasks();

  const myTasks: ITask[] = normalizeId<ITask>(unwrap(myTasksResponse));

  const filteredMyTasks: ITask[] = myTasks.filter((task: any) => {
    const taskWorkspaceId =
      task.workspace?.id ??
      task.workspace?._id ??
      (typeof task.workspace === "string" ? task.workspace : undefined);
    const taskProjectId =
      task.project?.id ??
      task.project?._id ??
      (typeof task.project === "string" ? task.project : undefined);

    if (
      isSpecificWorkspaceSelected &&
      taskWorkspaceId &&
      taskWorkspaceId !== selectedWorkspaceId
    ) {
      return false;
    }
    if (
      isSpecificProjectSelected &&
      taskProjectId &&
      taskProjectId !== selectedProjectId
    ) {
      return false;
    }
    if (
      selectedStatus &&
      selectedStatus !== "all" &&
      task.status !== selectedStatus
    ) {
      return false;
    }
    if (
      selectedPriority &&
      selectedPriority !== "all" &&
      task.priority !== selectedPriority
    ) {
      return false;
    }
    if (searchQuery?.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const title = (task.title ?? "").toLowerCase();
      const desc = (task.description ?? "").toLowerCase();
      if (!title.includes(q) && !desc.includes(q)) return false;
    }
    return true;
  });

  const rawTasksToRender: ITask[] = isSpecificBoardSelected
    ? boardTasks
    : filteredMyTasks;

  const tasksToRender: ITask[] = rawTasksToRender.map((task: any) => {
    const match = activeBoardColumns?.find(
      (col: any) =>
        normalizeCol(typeof col === "string" ? col : col?.name) ===
        normalizeCol(task.column),
    );
    const matchedName =
      typeof match === "string" ? match : (match as any)?.name;
    return matchedName ? { ...task, column: matchedName } : task;
  });

  // --- Metrics banner data, derived from whatever is currently on screen ---
  const metrics = useMemo(() => {
    const total = tasksToRender.length;

    const completed = tasksToRender.filter(
      (t: any) => t.status === "done" || t.status === "completed",
    ).length;

    const inProgress = tasksToRender.filter(
      (t: any) => t.status === "in_progress",
    ).length;

    const urgentCount = tasksToRender.filter(
      (t: any) => t.priority === "urgent" || t.priority === "high",
    ).length;

    const blockedCount = tasksToRender.filter(
      (t: any) =>
        t.status === "blocked" || t.column?.toLowerCase() === "blocked",
    ).length;

    const hoursLogged = tasksToRender.reduce(
      (sum: number, t: any) => sum + (Number(t.actualHours) || 0),
      0,
    );

    const estimatedHours = tasksToRender.reduce(
      (sum: number, t: any) => sum + (Number(t.estimatedHours) || 0),
      0,
    );

    return {
      total,
      completed,
      completedPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      inProgress,
      urgentCount,
      blockedCount,
      hoursLogged,
      estimatedHours,
    };
  }, [tasksToRender]);

  const isAnyMetaLoading =
    isWorkspacesLoading ||
    (isSpecificWorkspaceSelected && isProjectsLoading) ||
    isBoardsLoading;

  const isTasksLoading = isSpecificBoardSelected
    ? isBoardTasksLoading
    : isMyTasksLoading;

  const isTasksError = isSpecificBoardSelected
    ? isBoardTasksError
    : isMyTasksError;

  const hasActiveFilters = Boolean(
    isSpecificWorkspaceSelected ||
    isSpecificProjectSelected ||
    (selectedStatus && selectedStatus !== "all") ||
    (selectedPriority && selectedPriority !== "all") ||
    searchQuery?.trim(),
  );

  const handleTaskChanged = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    if (isSpecificBoardSelected && activeBoardId) {
      queryClient.invalidateQueries({
        queryKey: ["board-tasks", activeBoardId],
      });
    }
  };

  const { mutate: updateTaskMutate } = useUpdateTask();

  const handleDropTaskToColumn = (taskId: string, targetCol: string) => {
    const newStatus = columnToStatus[targetCol] || "in_progress";

    if (isSpecificBoardSelected && activeBoardId) {
      queryClient.setQueryData(["board-tasks", activeBoardId], (old: any) => {
        const list = old?.data ?? old ?? [];
        const updatedList = list.map((t: any) =>
          (t.id ?? t._id) === taskId
            ? { ...t, column: targetCol, status: newStatus }
            : t,
        );
        return old?.data ? { ...old, data: updatedList } : updatedList;
      });
    } else {
      queryClient.setQueryData(["my-tasks"], (old: any) => {
        const list = old?.data ?? old ?? [];
        const updatedList = list.map((t: any) =>
          (t.id ?? t._id) === taskId
            ? { ...t, column: targetCol, status: newStatus }
            : t,
        );
        return old?.data ? { ...old, data: updatedList } : updatedList;
      });
    }

    updateTaskMutate(
      { taskId, data: { column: targetCol, status: newStatus } },
      {
        onSuccess: () => {
          handleTaskChanged();
        },
        onError: () => {
          if (isSpecificBoardSelected && activeBoardId) {
            queryClient.invalidateQueries({
              queryKey: ["board-tasks", activeBoardId],
            });
          } else {
            queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
          }
        },
      },
    );
  };

  return (
    <>
      <Topbar
        variant="light"
        title="My Tasks"
        subtitle={
          tasksToRender.length === 0
            ? "No tasks match active filters."
            : `${tasksToRender.length} active task${tasksToRender.length === 1 ? "" : "s"} across workspaces`
        }
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <TaskMetricsBanner
          metrics={{
            total: metrics.total,
            completed: metrics.completed,
            inProgress: metrics.inProgress,
            blocked: metrics.blockedCount,
            urgent: metrics.urgentCount,
            totalEst: metrics.estimatedHours,
            totalAct: metrics.hoursLogged,
          }}
        />

        <TaskFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedWorkspaceId={selectedWorkspaceId}
          onWorkspaceChange={(id) => {
            setSelectedWorkspaceId(id);
            if (id !== "all") {
              setCurrentWorkspaceId(id);
            }
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
          projects={projects}
          boards={boards}
          onOpenCreateModal={(col) => {
            setCreateModalColumn(col || "To Do");
            setCreateModalOpen(true);
          }}
        />

        {isAnyMetaLoading || isTasksLoading ? (
          <TaskLoadingSkeleton viewMode={viewMode} />
        ) : isTasksError ? (
          <div className="py-8 text-center text-sm text-destructive">
            Failed to load tasks
            {isSpecificBoardSelected ? " for this board" : ""}.
          </div>
        ) : tasksToRender.length === 0 ? (
          <TaskEmptyState
            hasActiveFilters={hasActiveFilters}
            onCreateTask={() => {
              setCreateModalColumn("To Do");
              setCreateModalOpen(true);
            }}
          />
        ) : (
          <>
            {viewMode === "kanban" && (
              <TaskKanbanView
                columns={activeBoardColumns}
                tasks={tasksToRender}
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
                tasks={tasksToRender}
                onOpenTask={(id) => setSelectedTaskId(id)}
              />
            )}

            {viewMode === "grid" && (
              <TaskGridView
                tasks={tasksToRender}
                onOpenTask={(id) => setSelectedTaskId(id)}
              />
            )}
          </>
        )}
      </main>

      {createModalOpen && (
        <CreateTaskModal
          columns={activeBoardColumns}
          defaultColumn={createModalColumn}
          boardType={activeBoardType}
          defaultBoardId={activeBoardId}
          onClose={() => setCreateModalOpen(false)}
          onCreated={(response) => {
            const createdTask = (response as any).data ?? response;
            handleCreateTask?.(createdTask);
            setSelectedTaskId(createdTask.id ?? createdTask._id ?? null);
          }}
        />
      )}

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onChanged={handleTaskChanged}
        />
      )}
    </>
  );
};

export default MyTask;
