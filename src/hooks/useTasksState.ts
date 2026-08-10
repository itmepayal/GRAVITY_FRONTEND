import { useState, useMemo } from "react";
import {
  type ITask,
  columnToStatus,
} from "@/types/task";
import {
  WORKSPACES,
  PROJECTS,
  BOARDS,
  SPRINTS,
  USERS,
  ME,
  INITIAL_TASKS,
} from "@/constants/task/mockData";

export const useTasksState = () => {
  const [tasks, setTasks] = useState<ITask[]>(INITIAL_TASKS);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedBoardId, setSelectedBoardId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "grid">("kanban");
  const [showArchived, setShowArchived] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalColumn, setCreateModalColumn] = useState("To Do");

  // Projects filtered by selected workspace
  const filteredProjects = useMemo(() => {
    if (selectedWorkspaceId === "all") return PROJECTS;
    return PROJECTS.filter((p) => p.workspace.id === selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  // Boards filtered by project & workspace
  const filteredBoards = useMemo(() => {
    return BOARDS.filter((b) => {
      if (selectedWorkspaceId !== "all" && b.workspace.id !== selectedWorkspaceId) return false;
      if (selectedProjectId !== "all" && b.project.id !== selectedProjectId) return false;
      return true;
    });
  }, [selectedWorkspaceId, selectedProjectId]);

  // Active columns for Kanban
  const activeBoardColumns = useMemo(() => {
    if (selectedBoardId !== "all") {
      const b = BOARDS.find((x) => x.id === selectedBoardId);
      if (b) return b.columns;
    }
    return ["Backlog", "To Do", "In Progress", "In Review", "Testing", "Completed"];
  }, [selectedBoardId]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter((tk) => {
      if (!showArchived && tk.isArchived) return false;
      if (showArchived && !tk.isArchived) return false;
      if (selectedWorkspaceId !== "all" && tk.workspace.id !== selectedWorkspaceId) return false;
      if (selectedProjectId !== "all" && tk.project.id !== selectedProjectId) return false;
      if (selectedBoardId !== "all" && tk.board.id !== selectedBoardId) return false;
      if (selectedStatus !== "all" && tk.status !== selectedStatus) return false;
      if (selectedPriority !== "all" && tk.priority !== selectedPriority) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = tk.title.toLowerCase().includes(q);
        const matchDesc = (tk.description || "").toLowerCase().includes(q);
        const matchTags = tk.tags.some((t) => t.toLowerCase().includes(q));
        const matchProj = tk.project.name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTags && !matchProj) return false;
      }
      return true;
    });
  }, [
    tasks,
    showArchived,
    selectedWorkspaceId,
    selectedProjectId,
    selectedBoardId,
    selectedStatus,
    selectedPriority,
    searchQuery,
  ]);

  // Calculated metrics
  const metrics = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((t) => t.status === "completed").length;
    const inProgress = filteredTasks.filter((t) => t.status === "in_progress" || t.status === "in_review").length;
    const blocked = filteredTasks.filter((t) => t.status === "blocked").length;
    const urgent = filteredTasks.filter((t) => t.priority === "urgent").length;
    const totalEst = filteredTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    const totalAct = filteredTasks.reduce((acc, t) => acc + (t.actualHours || 0), 0);

    return { total, completed, inProgress, blocked, urgent, totalEst, totalAct };
  }, [filteredTasks]);

  // Selected task object
  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Column Drag & Drop update handler
  const handleDropTaskToColumn = (taskId: string, targetCol: string) => {
    const newStatus = columnToStatus[targetCol] || "in_progress";
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, column: targetCol, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const handleCreateTask = (newTask: ITask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: ITask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return {
    tasks,
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
    workspaces: WORKSPACES,
    projects: PROJECTS,
    boards: BOARDS,
    sprints: SPRINTS,
    users: USERS,
    currentMember: ME,
    selectedTaskId,
    setSelectedTaskId,
    activeTask,
    createModalOpen,
    setCreateModalOpen,
    createModalColumn,
    setCreateModalColumn,
    showArchived,
    setShowArchived,
    handleDropTaskToColumn,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
  };
};
