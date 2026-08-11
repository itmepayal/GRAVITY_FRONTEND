import { useMemo, useState } from "react";
import {
  BOARDS,
  WORKSPACES,
  PROJECTS,
  INITIAL_TASKS,
  USERS,
  ME,
} from "@/constants/task/mockData";
import {
  normalizeBoard,
  type BoardItem,
  type BoardType,
} from "@/components/board/types";
import type { BoardViewMode } from "@/components/board/BoardFilterBar";
import { type Toast, nextId } from "@/components/workspace";

export function useBoardsState() {
  const [boards, setBoards] = useState<BoardItem[]>(() =>
    BOARDS.map((b) =>
      normalizeBoard(
        b,
        INITIAL_TASKS.filter((t) => t.board.id === b.id).length,
      ),
    ),
  );

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | BoardType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<BoardViewMode>("grid");
  const [selectedBoard, setSelectedBoard] = useState<BoardItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const workspaces = useMemo(
    () => WORKSPACES.map((w) => ({ id: w.id, name: w.name })),
    [],
  );

  const filteredProjects = useMemo(() => {
    if (selectedWorkspaceId === "all") {
      return PROJECTS.map((p) => ({
        id: p.id,
        name: p.name,
        workspaceId: p.workspace.id,
      }));
    }
    return PROJECTS.filter((p) => p.workspace.id === selectedWorkspaceId).map(
      (p) => ({ id: p.id, name: p.name, workspaceId: p.workspace.id }),
    );
  }, [selectedWorkspaceId]);

  const filteredBoards = useMemo(() => {
    return boards.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.projectName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchWorkspace =
        selectedWorkspaceId === "all" || b.workspaceId === selectedWorkspaceId;
      const matchProject =
        selectedProjectId === "all" || b.projectId === selectedProjectId;
      const matchType = selectedType === "all" || b.type === selectedType;
      return matchSearch && matchWorkspace && matchProject && matchType;
    });
  }, [boards, searchQuery, selectedWorkspaceId, selectedProjectId, selectedType]);

  const metrics = useMemo(() => {
    const totalBoards = boards.length;
    const kanbanBoards = boards.filter((b) => b.type === "kanban").length;
    const scrumBoards = boards.filter((b) => b.type === "scrum").length;
    const totalTasks = boards.reduce((n, b) => n + b.tasksCount, 0);
    return { totalBoards, kanbanBoards, scrumBoards, totalTasks };
  }, [boards]);

  const addToast = (type: "success" | "info" | "warning", message: string) => {
    const id = nextId("tst");
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleCreateBoard = (data: {
    name: string;
    description: string;
    projectId: string;
    type: BoardType;
  }) => {
    const project = PROJECTS.find((p) => p.id === data.projectId);
    if (!project) return;

    const defaultColumns =
      data.type === "scrum"
        ? ["Backlog", "To Do", "In Progress", "In Review", "Done"]
        : ["Backlog", "To Do", "In Progress", "In Review", "Testing", "Completed"];

    const newBoard: BoardItem = {
      id: `board_${Date.now()}`,
      name: data.name,
      description: data.description,
      type: data.type,
      columns: defaultColumns,
      workspaceId: project.workspace.id,
      workspaceName: project.workspace.name,
      projectId: project.id,
      projectName: project.name,
      tasksCount: 0,
      createdByName: ME.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBoards((prev) => [newBoard, ...prev]);
    addToast("success", `Board "${data.name}" created successfully!`);
    setCreateModalOpen(false);
  };

  const handleUpdateBoard = (id: string, patch: Partial<BoardItem>) => {
    setBoards((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, ...patch, updatedAt: new Date().toISOString() }
          : b,
      ),
    );
    if (selectedBoard?.id === id) {
      setSelectedBoard((prev) =>
        prev ? { ...prev, ...patch, updatedAt: new Date().toISOString() } : null,
      );
    }
    addToast("success", "Board updated.");
  };

  const handleDeleteBoard = (id: string) => {
    const board = boards.find((b) => b.id === id);
    setBoards((prev) => prev.filter((b) => b.id !== id));
    if (selectedBoard?.id === id) setSelectedBoard(null);
    addToast("info", `Board "${board?.name ?? "Board"}" removed.`);
  };

  return {
    boards: filteredBoards,
    allBoards: boards,
    metrics,
    workspaces,
    projects: filteredProjects,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    selectedProjectId,
    setSelectedProjectId,
    selectedType,
    setSelectedType,
    selectedBoard,
    setSelectedBoard,
    createModalOpen,
    setCreateModalOpen,
    toasts,
    handleCreateBoard,
    handleUpdateBoard,
    handleDeleteBoard,
    users: USERS,
  };
}
