import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import { useGetAllUserBoards } from "@/hooks/queries/board/use-get-all-user-boards";
import { useGetBoardById } from "@/hooks/queries/board/use-get-board-by-id";
import { useGetBoardTasks } from "@/hooks/queries/board/use-get-board-tasks";
import { useCreateBoard } from "@/hooks/mutations/project/use-create-board";
import { useUpdateBoard } from "@/hooks/mutations/board/use-update-board";
import { useDeleteBoard } from "@/hooks/mutations/board/use-delete-board";
import { useCreateTask } from "@/hooks/mutations/task/use-create-task";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import {
  CreateTaskModal,
  type NewTaskInput,
  type TaskStatus,
} from "@/components/task/CreateTaskModal";
import { TaskDetailModal } from "@/components/task/TaskDetailModal";
import type { CreateTaskData } from "@/types/task";
import {
  INK,
  MINT,
  TEAL,
  BOARD_THEME,
  PRIORITY_META,
  PRIORITY_ORDER,
  TAG_COLORS,
  type BoardType,
  type Priority,
  type TagName,
  type Task,
} from "./type";
import {
  Plus,
  MoreHorizontal,
  MessageSquare,
  Paperclip,
  Flag,
  CalendarDays,
  KanbanSquare,
  ChevronDown,
  Search,
  ListTodo,
  Clock,
  CheckCircle2,
  Users,
  X,
  Check,
  AlertCircle,
  LayoutGrid,
  Pencil,
  Trash2,
  Zap,
} from "lucide-react";

interface ApiSubTask {
  id?: string;
  _id?: string;
  title: string;
  completed: boolean;
}

interface ApiTask {
  id?: string;
  _id?: string;

  title: string;
  description?: string;

  board?: string;
  project?: string;
  workspace?: string;
  sprint?: string;

  column: string;

  assignee?: string;
  assigneeLabel?: string;
  watchers?: string[];

  status: TaskStatus;
  priority: Priority;

  tags: string[];

  dueDate: string | null;

  estimatedHours?: number;
  actualHours?: number;

  subtasks?: ApiSubTask[];

  commentsCount?: number;
  attachmentsCount?: number;
  comments?: unknown[];
  attachments?: unknown[];

  isArchived?: boolean;
}

interface ApiBoardProject {
  id?: string;
  _id?: string;
  name?: string;
}

interface ApiBoard {
  id?: string;
  _id?: string;
  workspace?: string;
  project?: ApiBoardProject;
  name: string;
  description: string;
  type: BoardType;
  columns: string[];
  tasks?: ApiTask[];
}

interface WorkspaceOption {
  id: string;
  name: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

function unwrapList<T>(res: any): T[] {
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res?.data)) return res.data as T[];
  return [];
}

function unwrapObject<T>(res: any): T | undefined {
  if (!res) return undefined;
  if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
    return res.data as T;
  }
  return res as T;
}

function getProjectId(board: ApiBoard): string | undefined {
  return board.project?.id ?? board.project?._id;
}

function getBoardId(board: ApiBoard | undefined): string | undefined {
  return board?.id ?? board?._id;
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return text;
  return text.length > maxLen ? `${text.slice(0, maxLen).trim()}…` : text;
}

function mapApiTask(t: ApiTask): Task {
  return {
    id: t.id ?? t._id ?? "",
    title: t.title,
    priority: t.priority,
    tags: (t.tags ?? []).filter((tag): tag is TagName => tag in TAG_COLORS),
    assignee: t.assigneeLabel || "—",
    comments: t.comments?.length ?? t.commentsCount ?? 0,
    attachments: t.attachments?.length ?? t.attachmentsCount ?? 0,
    due: t.dueDate,
    storyPoints: t.estimatedHours,
  };
}

function groupTasksByColumn(
  columns: string[],
  apiTasks: ApiTask[] | undefined,
): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};
  for (const col of columns) grouped[col] = [];
  for (const t of apiTasks ?? []) {
    const mapped = mapApiTask(t);
    const col = t.column;
    if (!grouped[col]) grouped[col] = [];
    grouped[col].push(mapped);
  }
  return grouped;
}

function buildCreateTaskPayload(input: NewTaskInput): FormData {
  const fields: CreateTaskData = {
    board: input.board,
    project: input.project,
    workspace: input.workspace,
    sprint: input.sprint,
    title: input.title,
    description: input.description,
    column: input.column,
    status: input.status,
    priority: input.priority,
    tags: input.tags,
    assignee: input.assignee,
    watchers: input.watchers,
    dueDate: input.dueDate ?? undefined,
    estimatedHours: input.estimatedHours,
    actualHours: input.actualHours,
    subtasks: input.subtasks,
    isArchived: input.isArchived,
  };

  const cleanFields = Object.fromEntries(
    Object.entries(fields).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );

  const formData = new FormData();
  formData.append("data", JSON.stringify(cleanFields));

  (input.attachments || []).forEach((a) =>
    formData.append("attachments", a.file, a.name),
  );

  return formData;
}

function TaskCard({
  task,
  boardType,
  onOpen,
}: {
  task: Task;
  boardType: BoardType;
  onOpen: (taskId: string) => void;
}) {
  const priority = PRIORITY_META[task.priority];
  const theme = BOARD_THEME[boardType];

  return (
    <div
      onClick={() => onOpen(task.id)}
      className="cursor-pointer border border-l-[3px] bg-white p-3.5 transition-shadow hover:shadow-md"
      style={{ borderColor: `${INK}22`, borderLeftColor: theme.accent }}
    >
      {task.tags?.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {task.tags.map((tag) => {
            const meta = TAG_COLORS[tag] || { color: INK, bg: "#EDEBE3" };
            return (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ color: meta.color, backgroundColor: meta.bg }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      <p
        className="mb-3.5 text-sm font-bold leading-snug"
        style={{ color: INK }}
      >
        {task.title}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: priority.color, backgroundColor: priority.bg }}
          >
            <Flag size={10} />
            {priority.label}
          </span>

          {boardType === "scrum" && typeof task.storyPoints === "number" && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold"
              style={{ color: theme.accent, backgroundColor: theme.accentSoft }}
            >
              {task.storyPoints} SP
            </span>
          )}

          {task.due && (
            <span
              className="flex items-center gap-1 text-[11px] font-medium"
              style={{ color: `${INK}77` }}
            >
              <CalendarDays size={11} />
              {task.due}
            </span>
          )}
        </div>

        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center text-[9px] font-bold"
          style={{ backgroundColor: MINT, color: INK }}
        >
          {task.assignee}
        </div>
      </div>

      {(task.comments > 0 || task.attachments > 0) && (
        <div
          className="mt-3 flex items-center gap-3 border-t pt-3 text-[11px] font-medium"
          style={{ borderColor: `${INK}15`, color: `${INK}77` }}
        >
          {task.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={11} />
              {task.comments}
            </span>
          )}
          {task.attachments > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip size={11} />
              {task.attachments}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface ColumnProps {
  name: string;
  tasks: Task[];
  boardType: BoardType;
  onAddTask: (columnName: string) => void;
  onOpenTask: (taskId: string) => void;
  showWipLimit?: boolean;
  wipLimit?: number;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onRemoveColumn: (name: string) => void;
  canRemove: boolean;
}

function Column({
  name,
  tasks,
  boardType,
  onAddTask,
  onOpenTask,
  showWipLimit = false,
  wipLimit = 5,
  isMenuOpen,
  onToggleMenu,
  onRemoveColumn,
  canRemove,
}: ColumnProps) {
  const isOverLimit = showWipLimit && tasks.length > wipLimit;
  const theme = BOARD_THEME[boardType];

  return (
    <div className="flex max-h-full w-72 shrink-0 flex-col">
      <div
        className="flex items-center justify-between border-t-2 px-0.5 pb-3 pt-2"
        style={{ borderColor: theme.accent }}
      >
        <span
          className="flex items-center gap-2 text-sm font-black"
          style={{ color: INK }}
        >
          {name}
          <span
            className="flex h-5 items-center justify-center px-1.5 text-[11px] font-bold"
            style={{
              backgroundColor: isOverLimit ? "#FBEAE9" : theme.accentSoft,
              color: isOverLimit ? "#B3261E" : theme.badgeText,
            }}
          >
            {tasks.length}
            {showWipLimit ? ` / ${wipLimit}` : ""}
          </span>
          {isOverLimit && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ color: "#B3261E", backgroundColor: "#FBEAE9" }}
            >
              <AlertCircle size={9} />
              WIP limit
            </span>
          )}
        </span>
        <div className="relative">
          <button
            onClick={onToggleMenu}
            className="flex h-6 w-6 items-center justify-center"
            style={{ color: `${INK}66` }}
          >
            <MoreHorizontal size={14} />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 top-full z-10 mt-1 w-40 border bg-white py-1 shadow-lg"
              style={{ borderColor: `${INK}22` }}
            >
              <button
                onClick={() => onRemoveColumn(name)}
                disabled={!canRemove}
                title={
                  canRemove ? undefined : "A board needs at least one column"
                }
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#FBEAE9] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                style={{ color: "#B3261E" }}
              >
                <Trash2 size={12} />
                Remove column
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto pb-2 pr-1">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            boardType={boardType}
            onOpen={onOpenTask}
          />
        ))}

        {tasks.length === 0 && (
          <p
            className="py-4 text-center text-[11px] font-medium"
            style={{ color: `${INK}55` }}
          >
            No matching tasks
          </p>
        )}

        <button
          onClick={() => onAddTask(name)}
          className="flex w-full items-center justify-center gap-1.5 border border-dashed py-2.5 text-xs font-bold"
          style={{ borderColor: theme.accentBorder, color: `${INK}77` }}
        >
          <Plus size={13} />
          Add Task
        </button>
      </div>
    </div>
  );
}

function SprintBanner({ boardName }: { boardName: string }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border p-3.5"
      style={{ borderColor: `${TEAL}33`, backgroundColor: "#E7F5EF" }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center"
          style={{ backgroundColor: TEAL }}
        >
          <Zap size={15} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-black" style={{ color: INK }}>
            Sprint 1 · {boardName}
          </p>
          <p className="text-[11px] font-medium" style={{ color: `${INK}77` }}>
            Active sprint · 14 days remaining
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 px-2.5 py-1"
        style={{ backgroundColor: "white" }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-wide"
          style={{ color: TEAL }}
        >
          In Progress
        </span>
      </div>
    </div>
  );
}

interface CreateBoardModalProps {
  open: boolean;
  onClose: () => void;

  workspaceOptions: WorkspaceOption[];
  isLoadingWorkspaces: boolean;
  selectedWorkspaceId: string;
  onWorkspaceChange: (workspaceId: string) => void;

  projectOptions: ProjectOption[];
  isLoadingProjects: boolean;
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;

  boardName: string;
  onBoardNameChange: (name: string) => void;
  boardDescription: string;
  onBoardDescriptionChange: (description: string) => void;
  boardType: BoardType;
  onBoardTypeChange: (type: BoardType) => void;

  onSubmit: () => void;
  isSubmitting: boolean;
}

function CreateBoardModal({
  open,
  onClose,
  workspaceOptions,
  isLoadingWorkspaces,
  selectedWorkspaceId,
  onWorkspaceChange,
  projectOptions,
  isLoadingProjects,
  selectedProjectId,
  onProjectChange,
  boardName,
  onBoardNameChange,
  boardDescription,
  onBoardDescriptionChange,
  boardType,
  onBoardTypeChange,
  onSubmit,
  isSubmitting,
}: CreateBoardModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md border border-[#0F2D29]/15 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-black" style={{ color: INK }}>
            New Board
          </h2>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center"
            style={{ color: `${INK}99` }}
          >
            <X size={14} />
          </button>
        </div>

        <label
          className="mb-1 block text-[11px] font-bold"
          style={{ color: `${INK}B3` }}
        >
          Workspace
        </label>
        <select
          value={selectedWorkspaceId}
          onChange={(e) => onWorkspaceChange(e.target.value)}
          disabled={isLoadingWorkspaces}
          className="mb-3 w-full border bg-white px-3 py-2 text-xs outline-none disabled:opacity-60"
          style={{ borderColor: `${INK}33`, color: INK }}
        >
          <option value="">
            {isLoadingWorkspaces
              ? "Loading workspaces..."
              : "Select a workspace"}
          </option>
          {workspaceOptions.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>

        <label
          className="mb-1 block text-[11px] font-bold"
          style={{ color: `${INK}B3` }}
        >
          Project
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => onProjectChange(e.target.value)}
          disabled={!selectedWorkspaceId || isLoadingProjects}
          className="mb-3 w-full border bg-white px-3 py-2 text-xs outline-none disabled:opacity-60"
          style={{ borderColor: `${INK}33`, color: INK }}
        >
          <option value="">
            {!selectedWorkspaceId
              ? "Select a workspace first"
              : isLoadingProjects
                ? "Loading projects..."
                : "Select a project"}
          </option>
          {projectOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label
          className="mb-1 block text-[11px] font-bold"
          style={{ color: `${INK}B3` }}
        >
          Board name
        </label>
        <input
          value={boardName}
          onChange={(e) => onBoardNameChange(e.target.value)}
          placeholder="e.g. Sprint Board"
          className="mb-3 w-full border px-3 py-2 text-xs outline-none"
          style={{ borderColor: `${INK}33`, color: INK }}
        />

        <label
          className="mb-1 block text-[11px] font-bold"
          style={{ color: `${INK}B3` }}
        >
          Description (optional)
        </label>
        <textarea
          value={boardDescription}
          onChange={(e) => onBoardDescriptionChange(e.target.value)}
          placeholder="What's this board for?"
          rows={3}
          className="mb-3 w-full border px-3 py-2 text-xs outline-none"
          style={{ borderColor: `${INK}33`, color: INK }}
        />

        <label
          className="mb-1.5 block text-[11px] font-bold"
          style={{ color: `${INK}B3` }}
        >
          Board type
        </label>
        <div className="mb-4 flex gap-2">
          {(["kanban", "scrum"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onBoardTypeChange(t)}
              className="flex flex-1 items-center justify-center gap-1.5 border py-2 text-xs font-bold capitalize"
              style={{
                borderColor: boardType === t ? TEAL : `${INK}22`,
                backgroundColor: boardType === t ? "#E7F5EF" : "white",
                color: boardType === t ? TEAL : `${INK}99`,
              }}
            >
              {t === "scrum" ? <Zap size={13} /> : <LayoutGrid size={13} />}
              {t}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold"
            style={{ color: `${INK}B3` }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!selectedProjectId || !boardName.trim() || isSubmitting}
            className="px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: INK }}
          >
            {isSubmitting ? "Creating..." : "Create Board"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const Board = () => {
  const { openMobileNav } = useDashboardContext();
  const { projectId } = useParams<{ projectId: string }>();

  const {
    data: allBoardsResponse,
    isLoading,
    isError,
    error,
    refetch: refetchAllBoards,
  } = useGetAllUserBoards();

  const allBoards = unwrapList<ApiBoard>(allBoardsResponse);

  const [selectedBoardId, setSelectedBoardId] = useState<string>("");

  useEffect(() => {
    if (!allBoards.length) return;
    if (
      selectedBoardId &&
      allBoards.some((b) => (b.id ?? b._id) === selectedBoardId)
    ) {
      return;
    }
    const matched = allBoards.find((b) => getProjectId(b) === projectId);
    const fallback = matched ?? allBoards[0];
    setSelectedBoardId(fallback.id ?? fallback._id ?? "");
  }, [allBoards, projectId]);

  const board = useMemo(() => {
    if (!allBoards.length) return undefined;
    return (
      allBoards.find((b) => (b.id ?? b._id) === selectedBoardId) ?? allBoards[0]
    );
  }, [allBoards, selectedBoardId]);

  const { data: boardDetailResponse, isFetching: isBoardDetailFetching } =
    useGetBoardById(selectedBoardId);

  const boardDetail = useMemo(
    () => unwrapObject<ApiBoard>(boardDetailResponse),
    [boardDetailResponse],
  );

  const {
    data: boardTasksResponse,
    isFetching: isBoardTasksFetching,
    refetch: refetchBoardTasks,
  } = useGetBoardTasks(selectedBoardId);

  const [columns, setColumns] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    if (!board) return;
    setColumns(board.columns);
  }, [board]);

  useEffect(() => {
    if (!boardDetail) return;
    if (getBoardId(boardDetail) !== selectedBoardId) return;
    setColumns(boardDetail.columns);
  }, [boardDetail, selectedBoardId]);

  useEffect(() => {
    if (!selectedBoardId) return;
    const apiTasks = unwrapList<ApiTask>(boardTasksResponse);
    setTasks(groupTasksByColumn(columns, apiTasks));
  }, [boardTasksResponse, columns, selectedBoardId]);

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [openColumnMenu, setOpenColumnMenu] = useState<string | null>(null);

  const [showBoardMenu, setShowBoardMenu] = useState(false);

  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [editBoardName, setEditBoardName] = useState("");
  const [editBoardDescription, setEditBoardDescription] = useState("");
  const [editBoardType, setEditBoardType] = useState<BoardType>("kanban");

  const { mutate: updateBoardMutate, isPending: isUpdatingBoard } =
    useUpdateBoard();
  const { mutate: deleteBoardMutate, isPending: isDeletingBoard } =
    useDeleteBoard();

  const handleOpenEditBoard = () => {
    if (!board) return;
    setEditBoardName(board.name);
    setEditBoardDescription(board.description ?? "");
    setEditBoardType(board.type);
    setShowBoardMenu(false);
    setEditBoardOpen(true);
  };

  const handleSubmitEditBoard = () => {
    const boardId = getBoardId(board);
    if (!boardId || !editBoardName.trim()) return;
    updateBoardMutate(
      {
        boardId,
        data: {
          name: editBoardName.trim(),
          description: editBoardDescription.trim() || undefined,
          type: editBoardType,
        },
      },
      {
        onSuccess: async () => {
          setEditBoardOpen(false);
          await refetchAllBoards();
        },
      },
    );
  };

  const handleDeleteBoard = () => {
    const boardId = getBoardId(board);
    if (!boardId || !board) return;
    const confirmed = window.confirm(
      `Delete "${board.name}"? This can't be undone.`,
    );
    if (!confirmed) return;
    setShowBoardMenu(false);
    deleteBoardMutate(boardId, {
      onSuccess: async () => {
        const remaining = allBoards.filter((b) => (b.id ?? b._id) !== boardId);
        setSelectedBoardId(remaining[0]?.id ?? remaining[0]?._id ?? "");
        await refetchAllBoards();
      },
    });
  };

  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [boardType, setBoardType] = useState<BoardType>("kanban");

  const { mutate: createBoard, isPending: isCreatingBoard } = useCreateBoard();

  const { data: workspaces, isLoading: isLoadingWorkspaces } =
    useGetUserWorkspaces();

  const { data: workspaceProjects, isLoading: isLoadingProjects } =
    useGetWorkspaceProjects(selectedWorkspaceId);

  const workspaceOptions: WorkspaceOption[] = unwrapList<any>(workspaces).map(
    (ws: any) => ({ id: ws._id ?? ws.id, name: ws.name }),
  );

  const projectOptions: ProjectOption[] = unwrapList<any>(
    workspaceProjects,
  ).map((p: any) => ({ id: p._id ?? p.id, name: p.name }));

  const handleOpenCreateBoard = () => {
    setShowBoardMenu(false);

    const currentWorkspaceId = board?.workspace ?? "";
    setSelectedWorkspaceId(currentWorkspaceId);
    setSelectedProjectId(
      projectId ?? getProjectId(board ?? ({} as ApiBoard)) ?? "",
    );
    setBoardName("");
    setBoardDescription("");
    setBoardType("kanban");
    setCreateBoardOpen(true);
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setSelectedProjectId("");
  };

  const handleSubmitCreateBoard = () => {
    if (!selectedProjectId || !boardName.trim()) return;
    createBoard(
      {
        projectId: selectedProjectId,
        data: {
          name: boardName.trim(),
          description: boardDescription.trim() || undefined,
          type: boardType,
        },
      },
      {
        onSuccess: async (created: any) => {
          setCreateBoardOpen(false);

          const createdBoard = unwrapObject<ApiBoard>(created);
          const createdId = getBoardId(createdBoard);

          await refetchAllBoards();
          if (createdId) setSelectedBoardId(createdId);
        },
      },
    );
  };

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalColumn, setTaskModalColumn] = useState("");

  const { mutate: createTaskMutate, isPending: isCreatingTask } =
    useCreateTask();

  const handleOpenAddTask = (columnName: string) => {
    setTaskModalColumn(columnName);
    setTaskModalOpen(true);
  };

  const handleCreateTask = (input: NewTaskInput) => {
    const boardId = getBoardId(board);
    if (!boardId || !board) return;

    const normalizedInput: NewTaskInput = {
      ...input,
      board: boardId,
      project: input.project || getProjectId(board) || "",
      workspace: input.workspace || board.workspace || "",
    };

    const optimisticId = `t${Date.now()}`;
    const optimisticTask: Task = {
      id: optimisticId,
      title: normalizedInput.title,
      priority: normalizedInput.priority,
      tags: normalizedInput.tags,
      assignee: normalizedInput.assigneeLabel,
      comments: 0,
      attachments: 0,
      due: normalizedInput.dueDate,
      storyPoints: normalizedInput.estimatedHours,
    };

    setTasks((prev) => ({
      ...prev,
      [normalizedInput.column]: [
        ...(prev[normalizedInput.column] || []),
        optimisticTask,
      ],
    }));

    createTaskMutate(buildCreateTaskPayload(normalizedInput), {
      onSuccess: (created: any) => {
        const createdTask = unwrapObject<ApiTask>(created);
        if (createdTask) {
          setTasks((prev) => ({
            ...prev,
            [normalizedInput.column]: (prev[normalizedInput.column] || []).map(
              (t) =>
                t.id === optimisticId
                  ? mapApiTask({
                      ...createdTask,
                      assigneeLabel:
                        createdTask.assigneeLabel ||
                        normalizedInput.assigneeLabel,
                    })
                  : t,
            ),
          }));
        }

        refetchBoardTasks();
        setTaskModalOpen(false);
      },
      onError: () => {
        setTasks((prev) => ({
          ...prev,
          [normalizedInput.column]: (prev[normalizedInput.column] || []).filter(
            (t) => t.id !== optimisticId,
          ),
        }));
      },
    });
  };

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleOpenTask = (taskId: string) => {
    if (!taskId) return;
    setSelectedTaskId(taskId);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTaskId(null);
  };

  const handleTaskChanged = () => {
    refetchBoardTasks();
  };

  const totalTasks = Object.values(tasks).reduce(
    (sum, col) => sum + col.length,
    0,
  );
  const doneTasks = tasks.Done?.length ?? 0;
  const inProgressTasks = tasks["In Progress"]?.length ?? 0;
  const assignees = new Set(
    Object.values(tasks)
      .flat()
      .map((t) => t.assignee),
  ).size;

  const totalStoryPoints = Object.values(tasks)
    .flat()
    .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

  const metricCards = [
    {
      title: "Total Tasks",
      value: totalTasks,
      subtitle: "Across all columns",
      icon: ListTodo,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      subtitle: "Currently being worked",
      icon: Clock,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Completed",
      value: doneTasks,
      subtitle: "Marked as done",
      icon: CheckCircle2,
      accentColor: "#2563EB",
      bgGradient: "from-[#2563EB]/10 to-transparent",
    },
    board?.type === "scrum"
      ? {
          title: "Story Points",
          value: totalStoryPoints,
          subtitle: "Committed this sprint",
          icon: Zap,
          accentColor: TEAL,
          bgGradient: "from-[#0F8A65]/10 to-transparent",
        }
      : {
          title: "Contributors",
          value: assignees,
          subtitle: "Active board members",
          icon: Users,
          accentColor: "#D97706",
          bgGradient: "from-[#D97706]/10 to-transparent",
        },
  ];

  const persistColumns = (nextColumns: string[]) => {
    const boardIdForPersist = getBoardId(board);
    if (!boardIdForPersist) return;
    updateBoardMutate({
      boardId: boardIdForPersist,
      data: { columns: nextColumns },
    });
  };

  const handleAddColumn = () => {
    const name = newColumnName.trim();
    if (!name) return;
    if (columns.includes(name)) {
      setNewColumnName("");
      setShowAddColumn(false);
      return;
    }
    const nextColumns = [...columns, name];
    setColumns(nextColumns);
    setTasks((prev) => ({ ...prev, [name]: [] }));
    setNewColumnName("");
    setShowAddColumn(false);
    persistColumns(nextColumns);
  };

  const handleRemoveColumn = (name: string) => {
    setOpenColumnMenu(null);

    if (columns.length <= 1) {
      window.alert("A board needs at least one column.");
      return;
    }

    const columnTasks = tasks[name] ?? [];
    const confirmMessage =
      columnTasks.length > 0
        ? `"${name}" has ${columnTasks.length} task${columnTasks.length === 1 ? "" : "s"} in it. Remove this column anyway? Those tasks won't show up on the board until a column named "${name}" exists again.`
        : `Remove the "${name}" column?`;
    if (!window.confirm(confirmMessage)) return;

    const nextColumns = columns.filter((c) => c !== name);
    setColumns(nextColumns);
    setTasks((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    persistColumns(nextColumns);
  };

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result: Record<string, Task[]> = {};
    for (const col of columns) {
      const list = tasks[col] || [];
      result[col] = list.filter((task) => {
        const matchesQuery = query
          ? task.title.toLowerCase().includes(query)
          : true;
        const matchesPriority = priorityFilter
          ? task.priority === priorityFilter
          : true;
        return matchesQuery && matchesPriority;
      });
    }
    return result;
  }, [tasks, columns, searchQuery, priorityFilter]);

  const createBoardModalProps: CreateBoardModalProps = {
    open: createBoardOpen,
    onClose: () => setCreateBoardOpen(false),
    workspaceOptions,
    isLoadingWorkspaces,
    selectedWorkspaceId,
    onWorkspaceChange: handleWorkspaceChange,
    projectOptions,
    isLoadingProjects,
    selectedProjectId,
    onProjectChange: setSelectedProjectId,
    boardName,
    onBoardNameChange: setBoardName,
    boardDescription,
    onBoardDescriptionChange: setBoardDescription,
    boardType,
    onBoardTypeChange: setBoardType,
    onSubmit: handleSubmitCreateBoard,
    isSubmitting: isCreatingBoard,
  };

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm font-semibold" style={{ color: `${INK}77` }}>
          Loading board...
        </p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center"
            style={{ backgroundColor: "#FBEAE9" }}
          >
            <AlertCircle size={24} style={{ color: "#B3261E" }} />
          </div>
          <p className="text-sm font-bold" style={{ color: INK }}>
            Something went wrong
          </p>
          <p className="text-xs font-medium" style={{ color: `${INK}77` }}>
            {(error as Error)?.message ?? "Failed to load board."}
          </p>
        </div>
      </main>
    );
  }

  if (!board) {
    return (
      <>
        <Topbar
          variant="light"
          title="Board"
          subtitle="No board created for this project yet"
          onMenuClick={openMobileNav}
        />

        <main className="mx-auto flex w-full max-w-[1600px] flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="flex w-full max-w-md flex-col items-center border border-dashed border-[#0F2D29]/20 bg-white px-8 py-14 text-center">
            <div
              className="mb-5 flex h-16 w-16 items-center justify-center"
              style={{ backgroundColor: "#E7F5EF" }}
            >
              <KanbanSquare size={28} style={{ color: TEAL }} />
            </div>

            <h2 className="text-base font-black" style={{ color: INK }}>
              No board found
            </h2>
            <p
              className="mt-1.5 max-w-xs text-xs font-medium leading-relaxed"
              style={{ color: `${INK}77` }}
            >
              This project doesn't have a board yet. Create one to start
              organizing tasks into columns and tracking progress.
            </p>

            <button
              onClick={handleOpenCreateBoard}
              className="mt-6 flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white"
              style={{ backgroundColor: INK }}
            >
              <Plus size={13} />
              Create Board
            </button>
          </div>
        </main>

        <CreateBoardModal {...createBoardModalProps} />
      </>
    );
  }

  const theme = BOARD_THEME[board.type];
  const boardId = getBoardId(board) ?? "";

  return (
    <>
      <Topbar
        variant="light"
        title={truncateText(board.name, 40)}
        subtitle={`${totalTasks} tasks · ${truncateText(board.description, 70)}`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col space-y-6 p-4 sm:p-6 lg:p-8">
        <DashboardMetricsBanner cards={metricCards} />

        {board.type === "scrum" && <SprintBanner boardName={board.name} />}

        <div
          className="flex flex-wrap items-center justify-between gap-3 border p-3"
          style={{
            borderColor: theme.accentBorder,
            backgroundColor: theme.toolbarBg,
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: `${INK}55` }}
              />
              <input
                id="board-search-input"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 border bg-white py-2.5 pl-8 pr-3 text-xs outline-none"
                style={{ borderColor: `${INK}22`, color: INK }}
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilterMenu((v) => !v)}
                className="flex items-center gap-1.5 border bg-white px-3 py-2.5 text-xs font-bold"
                style={{
                  borderColor: priorityFilter ? theme.accent : `${INK}22`,
                  color: priorityFilter ? theme.accent : INK,
                }}
              >
                {priorityFilter
                  ? `Priority: ${PRIORITY_META[priorityFilter].label}`
                  : "Filter"}
                <ChevronDown size={13} />
              </button>

              {showFilterMenu && (
                <div
                  className="absolute left-0 top-full z-10 mt-1.5 w-44 border bg-white py-1 shadow-lg"
                  style={{ borderColor: `${INK}22` }}
                >
                  <button
                    onClick={() => {
                      setPriorityFilter(null);
                      setShowFilterMenu(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold hover:bg-[#EDEBE3]"
                    style={{ color: INK }}
                  >
                    All priorities
                    {!priorityFilter && <Check size={12} />}
                  </button>
                  {PRIORITY_ORDER.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPriorityFilter(p);
                        setShowFilterMenu(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold hover:bg-[#EDEBE3]"
                      style={{ color: PRIORITY_META[p].color }}
                    >
                      {PRIORITY_META[p].label}
                      {priorityFilter === p && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span
              className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: theme.accent, backgroundColor: theme.accentSoft }}
            >
              {board.type === "scrum" ? (
                <Zap size={11} />
              ) : (
                <KanbanSquare size={11} />
              )}
              {board.type}
              {(isBoardDetailFetching || isBoardTasksFetching) && (
                <span className="normal-case font-medium opacity-60">
                  · syncing
                </span>
              )}
            </span>

            {allBoards.length > 1 && (
              <div className="relative">
                <select
                  value={selectedBoardId}
                  onChange={(e) => setSelectedBoardId(e.target.value)}
                  className="appearance-none border bg-white py-2.5 pl-3 pr-7 text-xs font-bold outline-none"
                  style={{ borderColor: `${INK}22`, color: INK }}
                >
                  {allBoards.map((b) => (
                    <option key={b.id ?? b._id} value={b.id ?? b._id}>
                      {truncateText(b.name, 30)}
                      {b.project?.name
                        ? ` · ${truncateText(b.project.name, 20)}`
                        : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                  style={{ color: `${INK}77` }}
                />
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowBoardMenu((v) => !v)}
                className="flex h-8 w-8 items-center justify-center border bg-white"
                style={{ borderColor: `${INK}22`, color: `${INK}99` }}
              >
                <MoreHorizontal size={14} />
              </button>

              {showBoardMenu && (
                <div
                  className="absolute left-0 top-full z-10 mt-1.5 w-40 border bg-white py-1 shadow-lg"
                  style={{ borderColor: `${INK}22` }}
                >
                  <button
                    onClick={handleOpenEditBoard}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#EDEBE3]"
                    style={{ color: INK }}
                  >
                    <Pencil size={12} />
                    Edit board
                  </button>
                  <button
                    onClick={handleDeleteBoard}
                    disabled={isDeletingBoard}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#FBEAE9] disabled:opacity-50"
                    style={{ color: "#B3261E" }}
                  >
                    <Trash2 size={12} />
                    {isDeletingBoard ? "Deleting..." : "Delete board"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            {showAddColumn ? (
              <div
                className="flex items-center gap-1.5 border bg-white p-1.5"
                style={{ borderColor: `${INK}22` }}
              >
                <input
                  autoFocus
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn();
                    if (e.key === "Escape") {
                      setShowAddColumn(false);
                      setNewColumnName("");
                    }
                  }}
                  placeholder="Column name..."
                  className="w-40 px-2 py-1.5 text-xs outline-none"
                  style={{ color: INK }}
                />
                <button
                  onClick={handleAddColumn}
                  className="flex h-7 w-7 items-center justify-center text-white"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnName("");
                  }}
                  className="flex h-7 w-7 items-center justify-center"
                  style={{ color: `${INK}77` }}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white"
                style={{ backgroundColor: theme.accent }}
              >
                <Plus size={13} />
                Add Column
              </button>
            )}

            <button
              onClick={handleOpenCreateBoard}
              className="flex items-center gap-1.5 border bg-white px-3.5 py-2.5 text-xs font-bold"
              style={{ borderColor: `${INK}22`, color: INK }}
            >
              <LayoutGrid size={13} />
              Add Board
            </button>
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden pb-2">
          {columns.map((col) => (
            <Column
              key={col}
              name={col}
              tasks={filteredTasks[col] || []}
              boardType={board.type}
              onAddTask={handleOpenAddTask}
              onOpenTask={handleOpenTask}
              showWipLimit={board.type === "kanban" && col === "In Progress"}
              wipLimit={5}
              isMenuOpen={openColumnMenu === col}
              onToggleMenu={() =>
                setOpenColumnMenu((cur) => (cur === col ? null : col))
              }
              onRemoveColumn={handleRemoveColumn}
              canRemove={columns.length > 1}
            />
          ))}
        </div>
      </main>

      {editBoardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md border border-[#0F2D29]/15 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black" style={{ color: INK }}>
                Edit Board
              </h2>
              <button
                onClick={() => setEditBoardOpen(false)}
                className="flex h-6 w-6 items-center justify-center"
                style={{ color: `${INK}99` }}
              >
                <X size={14} />
              </button>
            </div>

            <label
              className="mb-1 block text-[11px] font-bold"
              style={{ color: `${INK}B3` }}
            >
              Board name
            </label>
            <input
              value={editBoardName}
              onChange={(e) => setEditBoardName(e.target.value)}
              placeholder="e.g. Sprint Board"
              className="mb-3 w-full border px-3 py-2 text-xs outline-none"
              style={{ borderColor: `${INK}33`, color: INK }}
            />

            <label
              className="mb-1 block text-[11px] font-bold"
              style={{ color: `${INK}B3` }}
            >
              Description (optional)
            </label>
            <textarea
              value={editBoardDescription}
              onChange={(e) => setEditBoardDescription(e.target.value)}
              placeholder="What's this board for?"
              rows={3}
              className="mb-3 w-full border px-3 py-2 text-xs outline-none"
              style={{ borderColor: `${INK}33`, color: INK }}
            />

            <label
              className="mb-1.5 block text-[11px] font-bold"
              style={{ color: `${INK}B3` }}
            >
              Board type
            </label>
            <div className="mb-4 flex gap-2">
              {(["kanban", "scrum"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setEditBoardType(t)}
                  className="flex flex-1 items-center justify-center gap-1.5 border py-2 text-xs font-bold capitalize"
                  style={{
                    borderColor: editBoardType === t ? TEAL : `${INK}22`,
                    backgroundColor: editBoardType === t ? "#E7F5EF" : "white",
                    color: editBoardType === t ? TEAL : `${INK}99`,
                  }}
                >
                  {t === "scrum" ? <Zap size={13} /> : <LayoutGrid size={13} />}
                  {t}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditBoardOpen(false)}
                className="px-3.5 py-2 text-xs font-bold"
                style={{ color: `${INK}B3` }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEditBoard}
                disabled={!editBoardName.trim() || isUpdatingBoard}
                className="px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: INK }}
              >
                {isUpdatingBoard ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {taskModalOpen && (
        <CreateTaskModal
          columns={columns}
          defaultColumn={taskModalColumn || columns[0] || ""}
          boardType={board.type}
          boardId={boardId}
          onClose={() => setTaskModalOpen(false)}
          onCreated={handleCreateTask}
          isSubmitting={isCreatingTask}
        />
      )}

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={handleCloseTaskDetail}
          onChanged={handleTaskChanged}
        />
      )}

      <CreateBoardModal {...createBoardModalProps} />
    </>
  );
};

export default Board;
