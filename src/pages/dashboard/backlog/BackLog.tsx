import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useSyncedWorkspace } from "@/hooks/useSyncedWorkspace";
import { useGetAllUserBoards } from "@/hooks/queries/board/use-get-all-user-boards";
import { useGetBoardById } from "@/hooks/queries/board/use-get-board-by-id";
import { useCreateTask } from "@/hooks/mutations/task/use-create-task";
import { useUpdateTask } from "@/hooks/mutations/task/use-update-task";
import { useDeleteTask } from "@/hooks/mutations/task/use-delete-task";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import { toast } from "sonner";
import {
  FONT_GOLDMAN,
  FONT_POPPINS,
  COMMON_CLASSES,
} from "@/components/common/design-system";

import {
  Layers,
  Search,
  Building2,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Kanban,
  Clock,
  AlertTriangle,
  User as UserIcon,
  Trash2,
  X,
  FileText,
  Tag,
} from "lucide-react";

export function BackLog() {
  const { openMobileNav } = useDashboardContext();

  const {
    workspaces,
    currentWorkspaceId: selectedWorkspaceId,
    setCurrentWorkspaceId: setSelectedWorkspaceId,
    isLoadingWorkspaces,
  } = useSyncedWorkspace();

  const { data: boardsResponse, isLoading: isLoadingBoards } =
    useGetAllUserBoards();
  const allBoards = boardsResponse?.data || [];

  const workspaceBoards = useMemo(() => {
    if (!selectedWorkspaceId) return allBoards;
    const filtered = allBoards.filter((b: any) => {
      const wsId =
        typeof b.workspace === "object"
          ? b.workspace?._id || b.workspace?.id
          : b.workspace;
      return wsId === selectedWorkspaceId;
    });
    return filtered.length > 0 ? filtered : allBoards;
  }, [allBoards, selectedWorkspaceId]);

  const [selectedBoardId, setSelectedBoardId] = useState<string>("");

  React.useEffect(() => {
    if (workspaceBoards.length > 0) {
      const currentValid = workspaceBoards.some(
        (b: any) => (b._id || b.id) === selectedBoardId,
      );
      if (!selectedBoardId || !currentValid) {
        setSelectedBoardId(workspaceBoards[0]._id || workspaceBoards[0].id);
      }
    } else if (allBoards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(allBoards[0]._id || allBoards[0].id);
    }
  }, [workspaceBoards, allBoards, selectedBoardId]);

  const {
    data: boardResponse,
    isLoading: isLoadingBoardDetails,
    isRefetching,
    refetch,
  } = useGetBoardById(selectedBoardId);

  const boardRespAny = boardResponse as any;
  const boardData = boardRespAny?.data?.board || boardRespAny?.board;
  const columnsData =
    boardRespAny?.data?.columns || boardRespAny?.columns || [];

  const allTasks = useMemo(() => {
    const list: any[] = [];
    columnsData.forEach((col: any) => {
      if (col.tasks && Array.isArray(col.tasks)) {
        list.push(...col.tasks);
      }
    });
    return list;
  }, [columnsData]);

  const backlogTasks = useMemo(() => {
    return allTasks.filter(
      (t: any) =>
        !t.sprint ||
        t.column?.toLowerCase() === "backlog" ||
        t.status === "todo",
    );
  }, [allTasks]);

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredBacklogTasks = useMemo(() => {
    return backlogTasks.filter((task: any) => {
      const matchesSearch =
        !searchQuery.trim() ||
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [backlogTasks, searchQuery, priorityFilter, statusFilter]);

  const totalEstimatedHours = useMemo(() => {
    return backlogTasks.reduce(
      (sum: number, t: any) => sum + (t.estimatedHours || 0),
      0,
    );
  }, [backlogTasks]);

  const urgentCount = useMemo(() => {
    return backlogTasks.filter(
      (t: any) => t.priority === "urgent" || t.priority === "high",
    ).length;
  }, [backlogTasks]);

  const activeWorkspaceName =
    workspaces.find((w: any) => (w._id || w.id) === selectedWorkspaceId)
      ?.name ?? "Workspace";

  const metricCards = [
    {
      title: "Backlog Tasks",
      value: backlogTasks.length,
      subtitle: "Unassigned backlog items",
      icon: Layers,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "Active Board",
      value: boardData?.name || "Select Board",
      subtitle: `${workspaceBoards.length} boards in ${activeWorkspaceName}`,
      icon: Kanban,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "High Priority",
      value: urgentCount,
      subtitle: "Urgent & high priority items",
      icon: AlertTriangle,
      accentColor: "#E11D48",
      bgGradient: "from-[#E11D48]/10 to-transparent",
    },
    {
      title: "Estimated Work",
      value: `${totalEstimatedHours}h`,
      subtitle: "Total estimated backlog effort",
      icon: Clock,
      accentColor: "#D97706",
      bgGradient: "from-[#D97706]/10 to-transparent",
    },
  ];

  // Mutations
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: createTask, isPending: isCreatingTask } = useCreateTask();

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<string>("medium");
  const [newTaskHours, setNewTaskHours] = useState<number>(4);

  // Delete Confirmation Modal State
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenModal = () => {
    if (!selectedBoardId && allBoards.length === 0) {
      toast.error(
        "No boards available in this workspace. Please create a board first.",
      );
      return;
    }
    setIsCreateModalOpen(true);
  };

  const resolveProjectId = (board: any): string | undefined => {
    if (!board) return undefined;
    const rawProject = board.project;
    if (!rawProject) return undefined;
    if (typeof rawProject === "object") {
      return rawProject._id || rawProject.id;
    }
    return rawProject;
  };

  const handleCreateBacklogTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedBoardId || !boardData) return;

    const projectId = resolveProjectId(boardData);

    if (!projectId) {
      toast.error(
        "This board isn't linked to a project, so a backlog task can't be created. Please link a project to this board first.",
      );
      return;
    }

    createTask(
      {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        workspace: selectedWorkspaceId,
        project: projectId,
        board: selectedBoardId,
        column: boardData.columns?.[0] || "Backlog",
        priority: newTaskPriority as any,
        estimatedHours: Number(newTaskHours) || 0,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setNewTaskTitle("");
          setNewTaskDesc("");
          refetch();
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to create backlog task.";
          toast.error(message);
        },
      },
    );
  };

  const handleColumnChange = (taskId: string, targetColumn: string) => {
    updateTask(
      { taskId, data: { column: targetColumn } },
      { onSuccess: () => refetch() },
    );
  };

  const handleDeleteTask = (task: any) => {
    setTaskToDelete(task);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    const taskId = taskToDelete._id || taskToDelete.id;

    setIsDeleting(true);
    deleteTask(taskId, {
      onSuccess: () => {
        toast.success(`"${taskToDelete.title}" was deleted.`);
        setTaskToDelete(null);
        setIsDeleting(false);
        refetch();
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete task.";
        toast.error(message);
        setIsDeleting(false);
      },
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setStatusFilter("all");
  };

  return (
    <>
      <Topbar
        variant="light"
        title="Product Backlog"
        subtitle={`${activeWorkspaceName} · ${backlogTasks.length} Items in Queue`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <DashboardMetricsBanner cards={metricCards} />

        <div className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[190px]">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Workspace
                </label>
                <div className="relative">
                  <select
                    value={selectedWorkspaceId}
                    onChange={(e) => {
                      setSelectedWorkspaceId(e.target.value);
                      setSelectedBoardId("");
                    }}
                    disabled={isLoadingWorkspaces}
                    className={COMMON_CLASSES.selectBase + " w-full pl-8"}
                  >
                    {workspaces.map((ws: any) => (
                      <option key={ws._id || ws.id} value={ws._id || ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                  <Building2
                    size={15}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5B6E68]"
                  />
                </div>
              </div>

              {/* Board Select */}
              <div className="min-w-[190px]">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Target Board
                </label>
                <div className="relative">
                  <select
                    value={selectedBoardId}
                    onChange={(e) => setSelectedBoardId(e.target.value)}
                    disabled={isLoadingBoards || workspaceBoards.length === 0}
                    className={COMMON_CLASSES.selectBase + " w-full pl-8"}
                  >
                    {workspaceBoards.map((b: any) => (
                      <option key={b._id || b.id} value={b._id || b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <Kanban
                    size={15}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5B6E68]"
                  />
                </div>
              </div>

              {/* Search Input */}
              <div className="min-w-[240px] flex-1">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Search Backlog
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title or details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={COMMON_CLASSES.inputBase + " pl-9"}
                  />
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
                  />
                </div>
              </div>
            </div>

            {/* Right Controls: Filters & New Task */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Priority Filter */}
              <div className="min-w-[140px]">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className={COMMON_CLASSES.selectBase + " w-full"}
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="min-w-[140px]">
                <label className={COMMON_CLASSES.labelUppercase}>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={COMMON_CLASSES.selectBase + " w-full"}
                >
                  <option value="all">All Statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2 pt-5">
                <button
                  onClick={handleOpenModal}
                  className={COMMON_CLASSES.btnPrimary}
                >
                  <Plus size={15} />
                  Add Backlog Item
                </button>

                <button
                  onClick={resetFilters}
                  title="Reset Filters"
                  className={COMMON_CLASSES.btnSecondary}
                >
                  <SlidersHorizontal size={14} />
                  Reset
                </button>

                <button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  title="Refresh Data"
                  className={COMMON_CLASSES.btnSecondary + " px-2.5"}
                >
                  <RefreshCw
                    size={14}
                    className={
                      isRefetching ? "animate-spin text-[#0F8A65]" : ""
                    }
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Backlog Item List Container */}
        <div className="border border-[#0F2D29]/15 bg-white p-6 shadow-2xs">
          <div className="mb-6 flex items-center justify-between border-b border-[#0F2D29]/10 pb-4">
            <h3
              className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}
            >
              <Layers className="text-[#0F8A65]" size={18} />
              Unassigned Backlog Items
            </h3>
            <span
              className={`${FONT_GOLDMAN} bg-[#0F2D29]/6 text-[#0F2D29] border border-[#0F2D29]/15 px-3 py-1 text-xs font-bold`}
            >
              {filteredBacklogTasks.length} Items
            </span>
          </div>

          {isLoadingBoardDetails ? (
            /* Skeleton Loading State */
            <div className="space-y-4 py-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 border border-[#0F2D29]/10 bg-gray-50/50 p-4 animate-pulse"
                >
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBacklogTasks.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0F2D29]/6 text-[#0F8A65] mb-4 border border-[#0F2D29]/12">
                <Layers size={32} />
              </div>
              <h4 className={`${COMMON_CLASSES.headingTitle} text-base`}>
                No backlog tasks found
              </h4>
              <p className={`${COMMON_CLASSES.headingSubtitle} mt-1 max-w-md`}>
                No backlog tasks match your filter criteria for this board.
                Create a new task or adjust your search.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                disabled={!selectedBoardId}
                className={`${COMMON_CLASSES.btnPrimary} mt-5`}
              >
                <Plus size={15} />
                Create First Backlog Item
              </button>
            </div>
          ) : (
            /* Backlog Items List */
            <div className="space-y-3">
              {filteredBacklogTasks.map((task: any) => {
                const assigneeObj =
                  typeof task.assignee === "object" ? task.assignee : null;
                const assigneeName = assigneeObj?.name || "Unassigned";

                const getPriorityClass = (priority: string) => {
                  switch (priority) {
                    case "urgent":
                      return "bg-rose-100 text-rose-800 border-rose-300";
                    case "high":
                      return "bg-amber-100 text-amber-800 border-amber-300";
                    case "medium":
                      return "bg-blue-100 text-blue-800 border-blue-300";
                    default:
                      return "bg-gray-100 text-gray-700 border-gray-300";
                  }
                };

                return (
                  <div
                    key={task._id || task.id}
                    className={`${COMMON_CLASSES.cardBase} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
                  >
                    {/* Left: Task Info */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0F2D29]/6 text-[#0F2D29] border border-[#0F2D29]/12">
                        <FileText size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`${FONT_GOLDMAN} text-[14px] font-bold text-[#0F2D29] truncate`}
                          >
                            {task.title}
                          </h4>
                          <span
                            className={`${FONT_GOLDMAN} uppercase border px-2 py-0.5 text-[10px] font-bold ${getPriorityClass(
                              task.priority,
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`${FONT_POPPINS} border border-[#0F2D29]/15 bg-gray-50 px-2 py-0.5 text-[10.5px] font-semibold text-[#5B6E68]`}
                          >
                            Col: {task.column}
                          </span>
                        </div>

                        {task.description && (
                          <p
                            className={`${FONT_POPPINS} mt-1 text-[12px] text-[#5B6E68] line-clamp-1`}
                          >
                            {task.description}
                          </p>
                        )}

                        <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11.5px] text-[#5B6E68]">
                          <span className="flex items-center gap-1">
                            <UserIcon size={13} className="text-[#8FA69E]" />
                            <span className="font-semibold text-[#0F2D29]">
                              {assigneeName}
                            </span>
                          </span>

                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-[#8FA69E]" />
                            <span>{task.estimatedHours || 0}h est</span>
                          </span>

                          {task.tags && task.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag size={13} className="text-[#8FA69E]" />
                              <span>{task.tags.join(", ")}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-[#0F2D29]/8 pt-3 sm:border-t-0 sm:pt-0 shrink-0">
                      <select
                        value={task.column}
                        onChange={(e) =>
                          handleColumnChange(
                            task._id || task.id,
                            e.target.value,
                          )
                        }
                        className={`${COMMON_CLASSES.selectBase} text-[11.5px] py-1.5 px-2`}
                      >
                        {boardData?.columns?.map((col: string) => (
                          <option key={col} value={col}>
                            Move to: {col}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDeleteTask(task)}
                        title="Delete Task"
                        className="p-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
          <div className={COMMON_CLASSES.modalShell}>
            <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
              <h3
                className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}
              >
                <Plus className="text-[#0F8A65]" size={18} />
                Create Backlog Item
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBacklogTask} className="p-4 space-y-4">
              <div>
                <label className={COMMON_CLASSES.labelUppercase}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement user authorization middleware"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed task description..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className={COMMON_CLASSES.selectBase + " w-full"}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(Number(e.target.value))}
                    className={COMMON_CLASSES.inputBase}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={COMMON_CLASSES.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className={COMMON_CLASSES.btnPrimary}
                >
                  {isCreatingTask ? "Creating..." : "Add to Backlog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
          <div className={COMMON_CLASSES.modalShell + " max-w-md"}>
            <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
              <h3
                className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2 text-rose-700`}
              >
                <Trash2 size={18} />
                Delete Backlog Item
              </h3>
              <button
                onClick={() => !isDeleting && setTaskToDelete(null)}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className={`${FONT_POPPINS} text-[13.5px] text-[#3A4B46]`}>
                Are you sure you want to permanently delete this task? This
                action cannot be undone.
              </p>

              <div className="border border-rose-200 bg-rose-50 px-3 py-2.5">
                <p
                  className={`${FONT_GOLDMAN} text-[13px] font-bold text-[#0F2D29] truncate`}
                >
                  {taskToDelete.title}
                </p>
                {taskToDelete.description && (
                  <p
                    className={`${FONT_POPPINS} mt-0.5 text-[11.5px] text-[#5B6E68] line-clamp-2`}
                  >
                    {taskToDelete.description}
                  </p>
                )}
              </div>

              <p className={`${FONT_POPPINS} text-[12px] text-[#8FA69E]`}>
                Type the task title below to confirm deletion.
              </p>

              <DeleteConfirmInput
                expectedTitle={taskToDelete.title}
                onConfirm={confirmDeleteTask}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 p-4">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className={COMMON_CLASSES.btnSecondary}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DeleteConfirmInput({
  expectedTitle,
  onConfirm,
}: {
  expectedTitle: string;
  onConfirm: () => void;
}) {
  const [value, setValue] = useState("");
  const isMatch =
    value.trim() === expectedTitle.trim() && value.trim().length > 0;

  return (
    <div className="space-y-2.5">
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={expectedTitle}
        className={COMMON_CLASSES.inputBase}
      />
      <button
        type="button"
        disabled={!isMatch}
        onClick={onConfirm}
        className={`${COMMON_CLASSES.btnPrimary} w-full justify-center bg-rose-600 hover:bg-rose-700 border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Trash2 size={15} />
        Confirm Delete
      </button>
    </div>
  );
}

export default BackLog;
