import { useMemo, useState, useEffect, useRef } from "react";
import {
  FolderKanban,
  Search,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Users,
  CalendarClock,
  ListChecks,
  Crown,
  Archive,
  PauseCircle,
  Ban,
  Rocket,
  ClipboardList,
  UserPlus,
  Loader2,
  LayoutGrid,
  Columns3,
  LayoutList,
  TrendingUp,
  Clock,
  ChevronRight,
  Layers,
  Zap,
  Trash2,
  Flag,
  Target,
  Plus,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { type Toast, nextId } from "@/components/workspace";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";
import { useAddProjectMember } from "@/hooks/mutations/project/use-add-project-member";
import { useUpdateProjectMemberRole } from "@/hooks/mutations/project/use-update-project-member-role";
import { useRemoveProjectMember } from "@/hooks/mutations/project/use-remove-project-member";
import { useGetWorkspaceRoles } from "@/hooks/queries/workspace/use-get-workspace-roles";
import { useGetProjectSprints } from "@/hooks/queries/project/use-get-project-sprints";
import { useGetWorkspaceGoals } from "@/hooks/queries/goal/get-workspace-goals";
import { useCreateSprint } from "@/hooks/mutations/project/use-create-sprint";
import { useQueryClient } from "@tanstack/react-query";

type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled"
  | "archived";

interface RefUser {
  id: string;
  name?: string;
  email?: string;
  avatar?: string | null;
}

interface RoleOption {
  id: string;
  name: string;
}

interface ProjectMember {
  user: RefUser | string;
  role: { id: string; name?: string } | string;
  joinedAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  workspace: string;
  owner: RefUser | string;
  members: ProjectMember[];
  tasks: string[];
  color: string;
  status: ProjectStatus;
  progress: number;
  isArchived: boolean;
  archivedAt?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_META: Record<
  ProjectStatus,
  {
    label: string;
    icon: typeof Rocket;
    color: string;
    bg: string;
    border: string;
  }
> = {
  planning: {
    label: "Planning",
    icon: ClipboardList,
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.1)",
    border: "rgba(139, 92, 246, 0.25)",
  },

  active: {
    label: "Active",
    icon: Rocket,
    color: "#0F8A65",
    bg: "rgba(15, 138, 101, 0.1)",
    border: "rgba(15, 138, 101, 0.25)",
  },

  on_hold: {
    label: "On Hold",
    icon: PauseCircle,
    color: "#D97706",
    bg: "rgba(217, 119, 6, 0.1)",
    border: "rgba(217, 119, 6, 0.25)",
  },

  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "#2563EB",
    bg: "rgba(37, 99, 235, 0.1)",
    border: "rgba(37, 99, 235, 0.25)",
  },

  cancelled: {
    label: "Cancelled",
    icon: Ban,
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.1)",
    border: "rgba(220, 38, 38, 0.25)",
  },

  archived: {
    label: "Archived",
    icon: Archive,
    color: "#5B6E68",
    bg: "rgba(91, 110, 104, 0.1)",
    border: "rgba(91, 110, 104, 0.25)",
  },
};

const DEFAULT_COLOR = "#0F8A65";

const normalizeUser = (raw: any): RefUser => ({
  id: raw._id ?? raw.id,
  name: raw.name ?? raw.email ?? "Unknown User",
  email: raw.email ?? "",
  avatar: raw.avatar ?? null,
});

const normalizeProject = (raw: any): Project => ({
  id: raw._id ?? raw.id,
  name: raw.name ?? "Untitled Project",
  description: raw.description ?? "",
  workspace: raw.workspace?._id ?? raw.workspace?.id ?? raw.workspace,
  owner:
    typeof raw.owner === "object" && raw.owner !== null
      ? normalizeUser(raw.owner)
      : raw.owner,
  members: Array.isArray(raw.members) ? raw.members : [],
  tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
  color: raw.color || DEFAULT_COLOR,
  status: raw.status ?? "planning",
  progress: Math.min(100, Math.max(0, raw.progress ?? 0)),
  isArchived: !!raw.isArchived,
  archivedAt: raw.archivedAt,
  startDate: raw.startDate,
  dueDate: raw.dueDate,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt ?? raw.createdAt,
});

const normalizeRole = (raw: any): RoleOption => ({
  id: raw._id ?? raw.id,
  name: raw.name ?? "Member",
});

const initials = (name?: string) =>
  (name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const AVATAR_PALETTE = [
  { bg: "#0F8A65", fg: "#ffffff" }, // pine
  { bg: "#D97706", fg: "#ffffff" }, // amber
  { bg: "#2563EB", fg: "#ffffff" }, // sky
  { bg: "#8B5CF6", fg: "#ffffff" }, // violet
  { bg: "#DB2777", fg: "#ffffff" }, // rose
  { bg: "#0891B2", fg: "#ffffff" }, // teal
  { bg: "#CA8A04", fg: "#ffffff" }, // gold
  { bg: "#4F46E5", fg: "#ffffff" }, // indigo
];

const avatarColor = (seed?: string) => {
  const str = seed || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const formatDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDaysRemaining = (dueDate?: string) => {
  if (!dueDate) return null;
  const due = new Date(dueDate).getTime();
  if (Number.isNaN(due)) return null;
  const diffMs = due - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const relativeTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value) ?? value;
};

const ProjectRowSkeleton = () => (
  <div className="flex items-center gap-3 rounded-2xl p-3.5 bg-[#0F2D29]/5 animate-pulse">
    <div className="h-10 w-10 shrink-0 rounded-xl bg-[#0F2D29]/10" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-3/4 rounded-md bg-[#0F2D29]/10" />
      <div className="h-3 w-1/2 rounded-md bg-[#0F2D29]/8" />
    </div>
  </div>
);

const AddMemberModal = ({
  project,
  candidates,
  roles,
  onClose,
}: {
  project: Project;
  candidates: RefUser[];
  roles: RoleOption[];
  onClose: () => void;
}) => {
  const [userId, setUserId] = useState(candidates[0]?.id ?? "");
  const [roleId, setRoleId] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const { mutate, isPending } = useAddProjectMember();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roleId && roles.length > 0) {
      const defaultRole =
        roles.find((r) => r.name?.toLowerCase() === "member") ?? roles[0];
      setRoleId(defaultRole.id);
    }
  }, [roles, roleId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !roleId) return;
    mutate(
      { projectId: project.id, data: { userId, roleId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["projects", project.workspace],
          });
          onClose();
        },
      },
    );
  };

  const selectedCandidate = candidates.find((c) => c.id === userId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md transition-all animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-[#0F2D29]/15 bg-white p-6 shadow-2xl transition-all sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8FE3C4]/30 ring-1 ring-[#8FE3C4]/50 text-[#0F8A65]">
              <UserPlus size={20} />
            </div>
            <div>
              <h2
                id="add-member-title"
                className="text-[16px] font-bold text-[#0F2D29]"
              >
                Add Team Member
              </h2>
              <p className="text-[12px] text-[#5B6E68]">
                Assign workspace member to{" "}
                <span className="font-semibold text-[#0F2D29]">
                  {project.name}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8FA69E] transition hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
          >
            <X size={18} />
          </button>
        </div>

        {candidates.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-[#0F2D29]/5 p-5 text-center">
            <Users className="mx-auto mb-2 text-[#5B6E68]" size={24} />
            <p className="text-[13px] font-semibold text-[#0F2D29]">
              All workspace users added
            </p>
            <p className="mt-1 text-[12px] text-[#5B6E68]">
              Everyone in this workspace is already assigned to this project.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider">
                Select Person
              </label>
              <div className="relative">
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-3 text-[13px] font-medium text-[#0F2D29] outline-none transition focus:border-[#0F8A65] focus:bg-white focus:ring-2 focus:ring-[#8FE3C4]/30"
                >
                  {candidates.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.email ? `(${u.email})` : ""}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA69E]">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>

            {selectedCandidate && (
              <div className="flex items-center gap-3 rounded-xl border border-[#0F2D29]/10 bg-[#8FE3C4]/10 p-3 animate-in fade-in duration-150">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold shadow-xs"
                  style={{
                    backgroundColor: avatarColor(selectedCandidate.name).bg,
                    color: avatarColor(selectedCandidate.name).fg,
                  }}
                >
                  {initials(selectedCandidate.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-[#0F2D29]">
                    {selectedCandidate.name}
                  </p>
                  <p className="truncate text-[11px] text-[#5B6E68]">
                    {selectedCandidate.email}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider">
                Assign Role
              </label>
              {roles.length === 0 ? (
                <p className="text-[12px] text-[#5B6E68]">
                  No roles found for this workspace.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => {
                    const isSelected = roleId === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setRoleId(r.id)}
                        className={`flex flex-col items-center rounded-xl border p-3 text-center transition ${
                          isSelected
                            ? "border-[#0F8A65] bg-[#0F8A65]/10 text-[#0F2D29] ring-1 ring-[#0F8A65]"
                            : "border-[#0F2D29]/10 bg-white text-[#5B6E68] hover:bg-[#0F2D29]/3 hover:text-[#0F2D29]"
                        }`}
                      >
                        <span className="text-[12.5px] font-bold capitalize">
                          {r.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#5B6E68] transition hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !userId || !roleId}
                className="flex items-center gap-2 rounded-xl bg-[#0F2D29] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md transition hover:bg-[#0F2D29]/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-98"
              >
                {isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Adding Member…
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    Add Member
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const ConfirmDeleteMemberModal = ({
  userName,
  projectName,
  isPending,
  onConfirm,
  onClose,
}: {
  userName?: string;
  projectName: string;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const targetName = userName ?? "this member";
  // Case-insensitive, trimmed match so a stray space/case difference doesn't block a legit confirm
  const isMatch =
    confirmText.trim().toLowerCase() === targetName.trim().toLowerCase();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, isPending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch || isPending) return;
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md transition-all animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-[#0F2D29]/15 bg-white p-6 shadow-2xl transition-all sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
            <Trash2 size={20} />
          </div>
          <div className="min-w-0">
            <h2
              id="confirm-delete-title"
              className="text-[16px] font-bold text-[#0F2D29]"
            >
              Remove Member?
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-[#5B6E68]">
              This will remove{" "}
              <span className="font-bold text-[#0F2D29]">{targetName}</span>{" "}
              from{" "}
              <span className="font-bold text-[#0F2D29]">{projectName}</span>.
              This action cannot be undone.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="confirm-delete-input"
            className="mb-2 block text-[12px] font-bold text-[#0F2D29]"
          >
            Type{" "}
            <span className="rounded bg-red-50 px-1.5 py-0.5 font-mono text-[12px] text-red-700">
              {targetName}
            </span>{" "}
            to confirm
          </label>
          <input
            ref={inputRef}
            id="confirm-delete-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isPending}
            autoComplete="off"
            placeholder={targetName}
            className="w-full rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-2.5 text-[13px] font-medium text-[#0F2D29] outline-none transition placeholder:text-[#8FA69E]/70 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:opacity-50"
          />

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#5B6E68] transition hover:bg-[#0F2D29]/5 hover:text-[#0F2D29] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !isMatch}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-98"
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Removing…
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  Remove
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface GoalOption {
  id: string;
  title: string;
  status?: string;
  progress?: number;
}

const normalizeGoalOption = (raw: any): GoalOption => ({
  id: raw._id ?? raw.id,
  title: raw.title ?? raw.name ?? "Untitled Goal",
  status: raw.status,
  progress: raw.progress,
});

interface SprintGoalRef {
  id: string;
  title: string;
  status?: string;
}

// The API may return `goal` as a populated Goal doc, a bare id string, or nothing.
const normalizeSprintGoal = (raw: any): SprintGoalRef | null => {
  if (!raw) return null;
  if (typeof raw === "string") {
    return { id: raw, title: "Linked goal" };
  }
  return {
    id: raw._id ?? raw.id,
    title: raw.title ?? raw.name ?? "Untitled Goal",
    status: raw.status,
  };
};

interface Sprint {
  id: string;
  name: string;
  goal?: SprintGoalRef | null;
  startDate: string;
  endDate: string;
  status?: string;
}

const normalizeSprint = (raw: any): Sprint => ({
  id: raw._id ?? raw.id,
  name: raw.name ?? "Untitled Sprint",
  goal: normalizeSprintGoal(raw.goal),
  startDate: raw.startDate,
  endDate: raw.endDate,
  status: raw.status,
});

const CreateSprintModal = ({
  projectId,
  projectName,
  goals,
  isLoadingGoals,
  onClose,
}: {
  projectId: string;
  projectName: string;
  goals: GoalOption[];
  isLoadingGoals: boolean;
  onClose: () => void;
}) => {
  const [name, setName] = useState("");
  // Linked goal is now selected from the workspace's existing goals (by id),
  // not free text — keeps sprint <-> goal relationship queryable/consistent.
  const [goalId, setGoalId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useCreateSprint();

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Sprint name is required.");
      return;
    }
    if (!startDate || !endDate) {
      setFormError("Start and end dates are required.");
      return;
    }
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      setFormError("End date can't be before the start date.");
      return;
    }

    mutate(
      {
        projectId,
        data: {
          name: name.trim(),
          goal: goalId || undefined,
          startDate,
          endDate,
        },
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md transition-all animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-sprint-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#0F2D29]/15 bg-white p-6 shadow-2xl transition-all sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8FE3C4]/30 ring-1 ring-[#8FE3C4]/50 text-[#0F8A65]">
              <Flag size={20} />
            </div>
            <div>
              <h2
                id="create-sprint-title"
                className="text-[16px] font-bold text-[#0F2D29]"
              >
                New Sprint
              </h2>
              <p className="text-[12px] text-[#5B6E68]">
                Plan a sprint for{" "}
                <span className="font-semibold text-[#0F2D29]">
                  {projectName}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8FA69E] transition hover:bg-[#0F2D29]/5 hover:text-[#0F2D29] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="sprint-name"
              className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider"
            >
              Sprint Name
            </label>
            <input
              ref={nameInputRef}
              id="sprint-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              placeholder="e.g. Sprint 12 — Checkout Revamp"
              className="w-full rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-3 text-[13px] font-medium text-[#0F2D29] outline-none transition placeholder:text-[#8FA69E] focus:border-[#0F8A65] focus:bg-white focus:ring-2 focus:ring-[#8FE3C4]/30 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="sprint-goal"
              className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider"
            >
              Link Goal{" "}
              <span className="normal-case font-medium text-[#8FA69E]">
                (optional)
              </span>
            </label>

            {isLoadingGoals ? (
              <div className="flex items-center gap-2 rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-3 text-[12px] text-[#5B6E68]">
                <Loader2 size={14} className="animate-spin" />
                Loading goals…
              </div>
            ) : goals.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#0F2D29]/15 px-4 py-3 text-[12px] text-[#5B6E68]">
                No goals created yet for this workspace.
              </p>
            ) : (
              <div className="relative">
                <select
                  id="sprint-goal"
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  disabled={isPending}
                  className="w-full appearance-none rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-3 text-[13px] font-medium text-[#0F2D29] outline-none transition focus:border-[#0F8A65] focus:bg-white focus:ring-2 focus:ring-[#8FE3C4]/30 disabled:opacity-50"
                >
                  <option value="">No goal linked</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA69E]">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="sprint-start"
                className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider"
              >
                Start Date
              </label>
              <input
                id="sprint-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isPending}
                className="w-full rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3 py-2.5 text-[13px] font-medium text-[#0F2D29] outline-none transition focus:border-[#0F8A65] focus:bg-white focus:ring-2 focus:ring-[#8FE3C4]/30 disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="sprint-end"
                className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider"
              >
                End Date
              </label>
              <input
                id="sprint-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isPending}
                min={startDate || undefined}
                className="w-full rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3 py-2.5 text-[13px] font-medium text-[#0F2D29] outline-none transition focus:border-[#0F8A65] focus:bg-white focus:ring-2 focus:ring-[#8FE3C4]/30 disabled:opacity-50"
              />
            </div>
          </div>

          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-600">
              <AlertCircle size={14} className="shrink-0" />
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#5B6E68] transition hover:bg-[#0F2D29]/5 hover:text-[#0F2D29] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-[#0F2D29] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md transition hover:bg-[#0F2D29]/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-98"
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus size={15} />
                  Create Sprint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Projects = () => {
  const { openMobileNav } = useDashboardContext();
  const queryClient = useQueryClient();

  const { data: workspacesResponse, isLoading: isLoadingWorkspaces } =
    useGetUserWorkspaces();
  const workspaces = Array.isArray(workspacesResponse)
    ? workspacesResponse
    : (workspacesResponse?.data ?? []);

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    null,
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "grid" | "table">("split");
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "members">(
    "overview",
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<{
    userId: string;
    userName?: string;
  } | null>(null);

  useEffect(() => {
    if (!activeWorkspaceId && workspaces.length > 0) {
      setActiveWorkspaceId(workspaces[0]._id ?? workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId]);

  const {
    data: projectsResponse,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
    isFetching: isFetchingProjects,
  } = useGetWorkspaceProjects(activeWorkspaceId ?? "");

  const allProjects: Project[] = useMemo(() => {
    const raw = Array.isArray(projectsResponse)
      ? projectsResponse
      : (projectsResponse?.data ?? []);
    return raw.map(normalizeProject);
  }, [projectsResponse]);

  const projects = useMemo(
    () => allProjects.filter((p) => showArchived || !p.isArchived),
    [allProjects, showArchived],
  );
  const archivedCount = useMemo(
    () => allProjects.filter((p) => p.isArchived).length,
    [allProjects],
  );

  const { data: usersResponse, isLoading: isLoadingUsers } = useGetAllUsers();
  const users = useMemo(() => {
    const raw = Array.isArray(usersResponse)
      ? usersResponse
      : (usersResponse ?? []);
    return raw.map(normalizeUser);
  }, [usersResponse]);
  const usersById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users],
  );

  const { data: rolesResponse } = useGetWorkspaceRoles(activeWorkspaceId ?? "");
  const roles: RoleOption[] = useMemo(() => {
    const raw = Array.isArray(rolesResponse)
      ? rolesResponse
      : (rolesResponse?.data ?? []);
    return raw.map(normalizeRole);
  }, [rolesResponse]);
  const rolesById = useMemo(
    () => new Map(roles.map((r) => [r.id, r.name])),
    [roles],
  );

  const { data: goalsResponse, isLoading: isLoadingGoals } =
    useGetWorkspaceGoals(activeWorkspaceId ?? "");
  const goals: GoalOption[] = useMemo(() => {
    const raw = Array.isArray(goalsResponse)
      ? goalsResponse
      : (goalsResponse?.data ?? []);
    return raw.map(normalizeGoalOption);
  }, [goalsResponse]);

  const {
    data: sprintsResponse,
    isLoading: isLoadingSprints,
    isError: isSprintsError,
    refetch: refetchSprints,
  } = useGetProjectSprints(activeProjectId ?? "");
  const sprints: Sprint[] = useMemo(() => {
    const raw = Array.isArray(sprintsResponse)
      ? sprintsResponse
      : (sprintsResponse?.data ?? []);
    return raw.map(normalizeSprint);
  }, [sprintsResponse]);

  const addToast = (type: Toast["type"], message: string) => {
    const id = nextId("tst");
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  useEffect(() => {
    if (activeProjectId && !projects.some((p) => p.id === activeProjectId)) {
      setActiveProjectId(null);
    }
  }, [projects, activeProjectId]);

  useEffect(() => {
    if (!activeProjectId && projects.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId]);

  useEffect(() => {
    setIsAddMemberOpen(false);
    setMemberToDelete(null);
    setIsCreateSprintOpen(false);
  }, [activeProjectId]);

  // Filter logic
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        selectedStatusFilter === "all" || p.status === selectedStatusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [projects, query, selectedStatusFilter]);

  const activeWorkspace = workspaces.find(
    (w: any) => (w._id ?? w.id) === activeWorkspaceId,
  );
  const canManage =
    activeWorkspace?.role === "owner" || activeWorkspace?.role === "admin";

  const refreshAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["projects", activeWorkspaceId],
    });
    addToast("info", "Projects refreshed successfully.");
  };

  const resolveOwner = (owner: Project["owner"]): RefUser | null => {
    if (!owner) return null;
    if (typeof owner === "string") return usersById.get(owner) ?? null;
    return owner;
  };

  const resolveMemberUser = (member: ProjectMember): RefUser | null => {
    if (typeof member.user === "string")
      return usersById.get(member.user) ?? null;
    return member.user;
  };

  const memberUserIds = useMemo(() => {
    if (!activeProject) return new Set<string>();
    return new Set(
      activeProject.members
        .map((m) => (typeof m.user === "string" ? m.user : m.user?.id))
        .filter(Boolean) as string[],
    );
  }, [activeProject]);

  const ownerId = activeProject
    ? typeof activeProject.owner === "string"
      ? activeProject.owner
      : activeProject.owner?.id
    : undefined;

  const addableUsers = useMemo(
    () => users.filter((u) => !memberUserIds.has(u.id) && u.id !== ownerId),
    [users, memberUserIds, ownerId],
  );

  // Overall Statistics for workspace projects KPI header
  const stats = useMemo(() => {
    const total = allProjects.length;
    const active = allProjects.filter((p) => p.status === "active").length;
    const completed = allProjects.filter(
      (p) => p.status === "completed",
    ).length;
    const avgProgress =
      total > 0
        ? Math.round(
            allProjects.reduce((acc, p) => acc + p.progress, 0) / total,
          )
        : 0;

    return { total, active, completed, avgProgress };
  }, [allProjects]);

  const { mutate: updateRole } = useUpdateProjectMemberRole();
  const { mutate: removeMember } = useRemoveProjectMember();

  const handleRoleChange = (userId: string, roleId: string) => {
    if (!activeProject) return;
    setPendingMemberId(userId);
    updateRole(
      { projectId: activeProject.id, userId, data: { roleId: roleId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["projects", activeWorkspaceId],
          });
          addToast("success", "Member role updated.");
        },
        onError: () => {
          addToast("warning", "Couldn't update member role.");
        },
        onSettled: () => setPendingMemberId(null),
      },
    );
  };

  const handleRemoveMember = (userId: string, userName?: string) => {
    setMemberToDelete({ userId, userName });
  };

  const confirmRemoveMember = () => {
    if (!activeProject || !memberToDelete) return;
    const { userId } = memberToDelete;
    setPendingMemberId(userId);
    removeMember(
      { projectId: activeProject.id, userId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["projects", activeWorkspaceId],
          });
          addToast("success", "Member removed from project.");
        },
        onError: () => {
          addToast("warning", "Couldn't remove member.");
        },
        onSettled: () => {
          setPendingMemberId(null);
          setMemberToDelete(null);
        },
      },
    );
  };

  return (
    <>
      <Topbar
        title="Projects Workspace"
        subtitle={
          projects.length === 0
            ? `No projects yet in ${activeWorkspace?.name ?? "this workspace"} — time to start one.`
            : `${projects.length} project${projects.length === 1 ? "" : "s"} to keep an eye on in ${activeWorkspace?.name ?? "this workspace"}`
        }
        onMenuClick={openMobileNav}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-4 shadow-sm backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#5B6E68] uppercase tracking-wider">
                Total Projects
              </p>
              <p className="mt-1 text-[22px] font-extrabold text-[#0F2D29] tracking-tight">
                {stats.total}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F2D29]/5 text-[#0F2D29]">
              <Layers size={20} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-4 shadow-sm backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#5B6E68] uppercase tracking-wider">
                Active Sprints
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[22px] font-extrabold text-[#0F8A65] tracking-tight">
                  {stats.active}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0F8A65]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0F8A65]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0F8A65] animate-pulse" />
                  Running
                </span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F8A65]/10 text-[#0F8A65]">
              <Rocket size={20} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-4 shadow-sm backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#5B6E68] uppercase tracking-wider">
                Avg Progress
              </p>
              <p className="mt-1 text-[22px] font-extrabold text-[#2563EB] tracking-tight">
                {stats.avgProgress}%
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-4 shadow-sm backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#5B6E68] uppercase tracking-wider">
                Completed
              </p>
              <p className="mt-1 text-[22px] font-extrabold text-[#8B5CF6] tracking-tight">
                {stats.completed}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-4 shadow-sm backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {workspaces.length > 0 && (
              <div className="relative">
                <select
                  value={activeWorkspaceId ?? ""}
                  onChange={(e) => {
                    setActiveWorkspaceId(e.target.value);
                    setActiveProjectId(null);
                  }}
                  className="rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 py-2 pr-8 pl-3 text-[12.5px] font-bold text-[#0F2D29] outline-none transition hover:bg-[#0F2D29]/5 focus:border-[#0F8A65] focus:ring-2 focus:ring-[#8FE3C4]/30"
                >
                  {workspaces.map((w: any) => (
                    <option key={w._id ?? w.id} value={w._id ?? w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <ChevronRight
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-[#5B6E68]"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5 border-l border-[#0F2D29]/10 pl-2">
              <button
                onClick={() => setSelectedStatusFilter("all")}
                className={`rounded-xl px-3 py-1.5 text-[12px] font-bold transition ${
                  selectedStatusFilter === "all"
                    ? "bg-[#0F2D29] text-white shadow-xs"
                    : "text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
                }`}
              >
                All ({allProjects.length})
              </button>
              {(Object.keys(STATUS_META) as ProjectStatus[]).map((st) => {
                const count = allProjects.filter((p) => p.status === st).length;
                if (count === 0 && st !== "active" && st !== "planning")
                  return null;
                const isSelected = selectedStatusFilter === st;
                return (
                  <button
                    key={st}
                    onClick={() => setSelectedStatusFilter(st)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-bold transition ${
                      isSelected
                        ? "bg-[#0F2D29] text-white shadow-xs"
                        : "text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
                    }`}
                  >
                    <span>{STATUS_META[st].label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[#0F2D29]/8 text-[#5B6E68]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-50 flex-1 md:w-64">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-xl border border-[#0F2D29]/15 bg-white py-2 pr-8 pl-9 text-[12.5px] font-medium text-[#0F2D29] outline-none transition placeholder:text-[#8FA69E] focus:border-[#0F8A65] focus:ring-2 focus:ring-[#8FE3C4]/30"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E] hover:text-[#0F2D29]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {archivedCount > 0 && (
              <button
                onClick={() => setShowArchived((v) => !v)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition ${
                  showArchived
                    ? "border-[#0F2D29]/30 bg-[#0F2D29]/10 text-[#0F2D29]"
                    : "border-[#0F2D29]/15 text-[#5B6E68] hover:bg-[#0F2D29]/5"
                }`}
                title="Toggle archived projects"
              >
                <Archive size={14} />
                <span className="hidden sm:inline">
                  {showArchived
                    ? "Hide Archived"
                    : `Archived (${archivedCount})`}
                </span>
              </button>
            )}

            <div className="flex items-center rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/5 p-0.5">
              <button
                onClick={() => setViewMode("split")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                  viewMode === "split"
                    ? "bg-white text-[#0F2D29] shadow-xs"
                    : "text-[#5B6E68] hover:text-[#0F2D29]"
                }`}
                title="Split Detail View"
              >
                <Columns3 size={15} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-white text-[#0F2D29] shadow-xs"
                    : "text-[#5B6E68] hover:text-[#0F2D29]"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                  viewMode === "table"
                    ? "bg-white text-[#0F2D29] shadow-xs"
                    : "text-[#5B6E68] hover:text-[#0F2D29]"
                }`}
                title="Table List View"
              >
                <LayoutList size={15} />
              </button>
            </div>

            <button
              onClick={refreshAll}
              disabled={isFetchingProjects}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#0F2D29]/15 bg-white text-[#0F2D29] shadow-xs transition hover:bg-[#0F2D29]/5 disabled:opacity-50"
              title="Refresh projects"
            >
              <RefreshCw
                size={15}
                className={
                  isFetchingProjects ? "animate-spin text-[#0F8A65]" : ""
                }
              />
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {isLoadingProjects ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ProjectRowSkeleton key={i} />
              ))
            ) : filtered.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-[#0F2D29]/20 bg-white p-12 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8FE3C4]/25 text-[#0F8A65]">
                  <Search size={26} />
                </div>
                <h3 className="text-[16px] font-bold text-[#0F2D29]">
                  Nothing matches yet
                </h3>
                <p className="mt-1 text-[13px] text-[#5B6E68]">
                  We couldn't find a project for that search — try a different
                  name or clear a filter pill.
                </p>
                {(query || selectedStatusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setSelectedStatusFilter("all");
                    }}
                    className="mt-4 rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold text-white transition hover:bg-[#0F2D29]/90"
                  >
                    Clear search & filters
                  </button>
                )}
              </div>
            ) : (
              filtered.map((p) => {
                const meta = STATUS_META[p.status];
                const StatusIcon = meta.icon;
                const daysRemaining = getDaysRemaining(p.dueDate);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveProjectId(p.id);
                      setViewMode("split");
                    }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-5 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                    style={{ borderTop: `4px solid ${p.color}` }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                            style={{
                              backgroundColor: `${p.color}1E`,
                              color: p.color,
                            }}
                          >
                            <FolderKanban size={20} />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-bold text-[#0F2D29] group-hover:text-[#0F8A65] transition">
                              {p.name}
                            </h3>
                            <p className="text-[11px] text-[#8FA69E] font-medium">
                              Updated {relativeTime(p.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                          style={{
                            backgroundColor: meta.bg,
                            color: meta.color,
                          }}
                        >
                          <StatusIcon size={12} />
                          {meta.label}
                        </span>
                      </div>

                      {p.description && (
                        <p className="mt-3 text-[12.5px] leading-relaxed text-[#5B6E68] line-clamp-2">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#0F2D29]/8 space-y-3">
                      <div>
                        <div className="mb-1 flex justify-between text-[11px] font-bold text-[#5B6E68]">
                          <span>Progress</span>
                          <span>{p.progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#0F2D29]/8">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${p.progress}%`,
                              backgroundColor: p.color,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-[12px] font-bold text-[#0F2D29]">
                          <Users size={14} className="text-[#5B6E68]" />
                          <span>{p.members.length} members</span>
                        </div>

                        {daysRemaining !== null && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold ${
                              daysRemaining < 0
                                ? "bg-red-50 text-red-600"
                                : daysRemaining <= 5
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-[#0F2D29]/5 text-[#5B6E68]"
                            }`}
                          >
                            <Clock size={12} />
                            {daysRemaining < 0
                              ? `${Math.abs(daysRemaining)}d overdue`
                              : `${daysRemaining}d left`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-hidden rounded-2xl border border-[#0F2D29]/10 bg-white/90 shadow-sm backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-[#0F2D29]/10 bg-[#0F2D29]/3 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">
                  <tr>
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Progress</th>
                    <th className="py-3.5 px-4">Members</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F2D29]/6">
                  {filtered.map((p) => {
                    const meta = STATUS_META[p.status];
                    const StatusIcon = meta.icon;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setActiveProjectId(p.id);
                          setViewMode("split");
                        }}
                        className="hover:bg-[#0F2D29]/3 cursor-pointer transition"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            <div>
                              <p className="font-bold text-[#0F2D29]">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-[#5B6E68]">
                                {p.tasks.length} tasks
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                            style={{
                              backgroundColor: meta.bg,
                              color: meta.color,
                            }}
                          >
                            <StatusIcon size={12} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 w-44">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#0F2D29]/8">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${p.progress}%`,
                                  backgroundColor: p.color,
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-[#5B6E68]">
                              {p.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#0F2D29]">
                          {p.members.length} members
                        </td>
                        <td className="py-3.5 px-4 text-[12px] text-[#5B6E68]">
                          {formatDate(p.dueDate) ?? "No due date"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProjectId(p.id);
                              setViewMode("split");
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-[#0F2D29]/5 px-3 py-1.5 text-[12px] font-bold text-[#0F2D29] hover:bg-[#0F2D29] hover:text-white transition"
                          >
                            View Details
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-84 xl:w-90">
              <div className="overflow-hidden rounded-2xl border border-[#0F2D29]/10 bg-white/90 shadow-sm backdrop-blur-md">
                <div className="border-b border-[#0F2D29]/8 bg-linear-to-br from-[#8FE3C4]/15 via-transparent to-[#0F2D29]/3 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8FE3C4]/30 text-[#0F8A65] ring-1 ring-[#8FE3C4]/50">
                        <FolderKanban size={18} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#0F2D29]">
                          Projects List
                        </p>
                        <p className="text-[11px] font-semibold text-[#5B6E68]">
                          Showing {filtered.length} of {allProjects.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {isLoadingWorkspaces || isLoadingProjects ? (
                  <div className="space-y-2 p-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <ProjectRowSkeleton key={i} />
                    ))}
                  </div>
                ) : isProjectsError ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                    <AlertCircle size={24} className="text-red-500" />
                    <p className="text-[13px] font-bold text-[#0F2D29]">
                      Couldn't load projects
                    </p>
                    <button
                      onClick={refreshAll}
                      className="mt-1 rounded-xl bg-[#0F2D29] px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#0F2D29]/90"
                    >
                      Try again
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F2D29]/5 text-[#8FA69E]">
                      <Search size={20} />
                    </div>
                    <p className="text-[13.5px] font-bold text-[#0F2D29]">
                      No matching projects
                    </p>
                    <p className="mt-1 text-[12px] text-[#5B6E68]">
                      Try a different search term or clear a filter.
                    </p>
                  </div>
                ) : (
                  <ul
                    className="max-h-[min(620px,68vh)] space-y-1.5 overflow-y-auto p-2.5"
                    role="listbox"
                    aria-label="Projects"
                  >
                    {filtered.map((p) => {
                      const meta = STATUS_META[p.status];
                      const StatusIcon = meta.icon;
                      const active = p.id === activeProjectId;
                      return (
                        <li key={p.id} role="presentation">
                          <button
                            onClick={() => setActiveProjectId(p.id)}
                            role="option"
                            aria-selected={active}
                            className={`group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-all ${
                              active
                                ? "bg-[#0F2D29] text-white shadow-md"
                                : "hover:bg-[#0F2D29]/5 text-[#0F2D29]"
                            }`}
                          >
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition"
                              style={{
                                backgroundColor: active
                                  ? "rgba(255,255,255,0.18)"
                                  : `${p.color}22`,
                                color: active ? "#ffffff" : p.color,
                              }}
                            >
                              <FolderKanban size={17} />
                            </div>

                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-1">
                                <span
                                  className={`truncate text-[13.5px] font-bold ${
                                    active ? "text-white" : "text-[#0F2D29]"
                                  }`}
                                >
                                  {p.name}
                                </span>
                                {p.isArchived && (
                                  <Archive
                                    size={12}
                                    className={
                                      active
                                        ? "text-white/60"
                                        : "text-[#8FA69E]"
                                    }
                                  />
                                )}
                              </span>

                              <span
                                className={`mt-1 flex items-center justify-between text-[11px] ${
                                  active ? "text-white/70" : "text-[#5B6E68]"
                                }`}
                              >
                                <span className="flex items-center gap-1 font-semibold">
                                  <StatusIcon
                                    size={11}
                                    style={{
                                      color: active ? "#ffffff" : meta.color,
                                    }}
                                  />
                                  {meta.label}
                                </span>
                                <span className="font-bold">{p.progress}%</span>
                              </span>

                              {p.members.length > 0 && (
                                <span className="mt-1.5 flex items-center -space-x-1.5">
                                  {p.members.slice(0, 4).map((m, i) => {
                                    const mu =
                                      typeof m.user === "string"
                                        ? usersById.get(m.user)
                                        : m.user;
                                    const av = avatarColor(mu?.name);
                                    return (
                                      <span
                                        key={i}
                                        className="flex h-5 w-5 items-center justify-center rounded-full border-2 text-[8px] font-bold"
                                        style={{
                                          backgroundColor: av.bg,
                                          color: av.fg,
                                          borderColor: active
                                            ? "#0F2D29"
                                            : "#ffffff",
                                        }}
                                      >
                                        {initials(mu?.name)}
                                      </span>
                                    );
                                  })}
                                  {p.members.length > 4 && (
                                    <span
                                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[8px] font-bold ${
                                        active
                                          ? "bg-white/20 text-white"
                                          : "bg-[#0F2D29]/10 text-[#5B6E68]"
                                      }`}
                                      style={{
                                        borderColor: active
                                          ? "#0F2D29"
                                          : "#ffffff",
                                      }}
                                    >
                                      +{p.members.length - 4}
                                    </span>
                                  )}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </aside>

            <section className="min-w-0 flex-1 space-y-6">
              {!activeProject ? (
                <div className="flex min-h-115 flex-col items-center justify-center rounded-3xl border border-dashed border-[#0F2D29]/20 bg-white/80 p-8 text-center shadow-xs">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#8FE3C4]/30 text-[#0F8A65] ring-1 ring-[#8FE3C4]/50">
                    <FolderKanban size={32} />
                  </div>
                  <h2 className="text-[20px] font-bold text-[#0F2D29]">
                    Pick a project to dive in
                  </h2>
                  <p className="mt-2 max-w-sm text-[13px] text-[#5B6E68] leading-relaxed">
                    Choose one from the list on the left and you'll see its
                    progress, tasks, and who's working on it.
                  </p>
                </div>
              ) : (
                (() => {
                  const meta = STATUS_META[activeProject.status];
                  const StatusIcon = meta.icon;
                  const owner = resolveOwner(activeProject.owner);
                  const dueDate = formatDate(activeProject.dueDate);
                  const startDate = formatDate(activeProject.startDate);
                  const daysRemaining = getDaysRemaining(activeProject.dueDate);
                  const isOverdue =
                    activeProject.dueDate &&
                    !["completed", "cancelled", "archived"].includes(
                      activeProject.status,
                    ) &&
                    new Date(activeProject.dueDate).getTime() < Date.now();

                  return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div
                        className="overflow-hidden rounded-3xl border border-[#0F2D29]/10 bg-white/90 shadow-sm backdrop-blur-md transition-all"
                        style={{
                          borderTop: `4px solid ${activeProject.color}`,
                        }}
                      >
                        <div className="p-6 sm:p-7">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span
                                  className="h-3 w-3 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor: activeProject.color,
                                  }}
                                />
                                <h1 className="truncate text-[22px] font-extrabold tracking-tight text-[#0F2D29]">
                                  {activeProject.name}
                                </h1>

                                <span
                                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold"
                                  style={{
                                    backgroundColor: meta.bg,
                                    color: meta.color,
                                    border: `1px solid ${meta.border}`,
                                  }}
                                >
                                  <StatusIcon size={13} />
                                  {meta.label}
                                </span>

                                {activeProject.isArchived && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0F2D29]/10 px-2.5 py-1 text-[11px] font-bold text-[#5B6E68]">
                                    <Archive size={12} />
                                    Archived
                                  </span>
                                )}

                                {isOverdue && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold text-red-700">
                                    <AlertCircle size={12} />
                                    Overdue by{" "}
                                    {daysRemaining
                                      ? Math.abs(daysRemaining)
                                      : ""}{" "}
                                    days
                                  </span>
                                )}
                              </div>

                              {activeProject.description && (
                                <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-[#5B6E68]">
                                  {activeProject.description}
                                </p>
                              )}

                              <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] font-semibold text-[#5B6E68]">
                                {owner && (
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                                      style={{
                                        backgroundColor: avatarColor(owner.name)
                                          .bg,
                                        color: avatarColor(owner.name).fg,
                                      }}
                                    >
                                      {initials(owner.name)}
                                    </span>
                                    <Crown
                                      size={13}
                                      className="text-[#D97706]"
                                    />
                                    <span className="font-bold text-[#0F2D29]">
                                      {owner.name}
                                    </span>
                                    <span className="text-[#8FA69E]">
                                      owns this
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <Clock size={14} className="text-[#5B6E68]" />
                                  <span>
                                    Updated{" "}
                                    {relativeTime(activeProject.updatedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {canManage && (
                              <div className="flex shrink-0 items-center gap-2.5">
                                <button
                                  onClick={() => setIsAddMemberOpen(true)}
                                  className="flex items-center gap-2 rounded-xl border border-[#0F2D29]/15 bg-white px-4 py-2.5 text-[13px] font-bold text-[#0F2D29] shadow-xs transition hover:bg-[#0F2D29]/5 focus:ring-2 focus:ring-[#8FE3C4]"
                                >
                                  <UserPlus
                                    size={15}
                                    className="text-[#0F8A65]"
                                  />
                                  Add Member
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="mt-6">
                            <div className="mb-2 flex items-center justify-between text-[12px] font-bold">
                              <span className="text-[#5B6E68] uppercase tracking-wider text-[11px]">
                                Overall Completion
                              </span>
                              <span className="text-[#0F2D29] text-[13px] font-extrabold">
                                {activeProject.progress}%
                              </span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#0F2D29]/8 p-0.5">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${activeProject.progress}%`,
                                  backgroundColor: activeProject.color,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex border-t border-[#0F2D29]/10 bg-[#0F2D29]/3 px-6">
                          <button
                            onClick={() => setActiveTab("overview")}
                            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-[13px] font-bold transition ${
                              activeTab === "overview"
                                ? "border-[#0F2D29] text-[#0F2D29]"
                                : "border-transparent text-[#5B6E68] hover:text-[#0F2D29]"
                            }`}
                          >
                            <TrendingUp size={15} />
                            Overview
                          </button>
                          <button
                            onClick={() => setActiveTab("tasks")}
                            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-[13px] font-bold transition ${
                              activeTab === "tasks"
                                ? "border-[#0F2D29] text-[#0F2D29]"
                                : "border-transparent text-[#5B6E68] hover:text-[#0F2D29]"
                            }`}
                          >
                            <ListChecks size={15} />
                            Tasks & Board ({activeProject.tasks.length})
                          </button>
                          <button
                            onClick={() => setActiveTab("members")}
                            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-[13px] font-bold transition ${
                              activeTab === "members"
                                ? "border-[#0F2D29] text-[#0F2D29]"
                                : "border-transparent text-[#5B6E68] hover:text-[#0F2D29]"
                            }`}
                          >
                            <Users size={15} />
                            Team Roster ({activeProject.members.length})
                          </button>
                        </div>
                      </div>

                      {activeTab === "overview" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-5 shadow-xs flex items-center gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#8FE3C4]/25 text-[#0F8A65]">
                                <ListChecks size={22} />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">
                                  Tasks Count
                                </p>
                                <p className="text-[20px] font-extrabold text-[#0F2D29]">
                                  {activeProject.tasks.length} Total Tasks
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-5 shadow-xs flex items-center gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#8FE3C4]/25 text-[#0F8A65]">
                                <Users size={22} />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">
                                  Team Size
                                </p>
                                <p className="text-[20px] font-extrabold text-[#0F2D29]">
                                  {isLoadingUsers
                                    ? "…"
                                    : `${activeProject.members.length} Members`}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-5 shadow-xs flex items-center gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#8FE3C4]/25 text-[#0F8A65]">
                                <CalendarClock size={22} />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">
                                  Timeline Status
                                </p>
                                <p
                                  className={`text-[15px] font-extrabold ${isOverdue ? "text-red-600" : "text-[#0F2D29]"}`}
                                >
                                  {dueDate
                                    ? `Due ${dueDate}`
                                    : "No deadline set"}
                                </p>
                                {daysRemaining !== null && (
                                  <p className="text-[11px] font-semibold text-[#5B6E68] mt-0.5">
                                    {daysRemaining < 0
                                      ? `${Math.abs(daysRemaining)} days overdue`
                                      : `${daysRemaining} days remaining`}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-6 shadow-xs space-y-4">
                            <h3 className="text-[15px] font-bold text-[#0F2D29] flex items-center gap-2">
                              <Zap size={18} className="text-[#0F8A65]" />
                              Project Health & Schedule
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div className="rounded-xl border border-[#0F2D29]/8 bg-[#0F2D29]/3 p-4">
                                <p className="text-[11px] font-bold text-[#5B6E68] uppercase">
                                  Start Date
                                </p>
                                <p className="text-[14px] font-bold text-[#0F2D29] mt-1">
                                  {startDate ?? "Not specified"}
                                </p>
                              </div>
                              <div className="rounded-xl border border-[#0F2D29]/8 bg-[#0F2D29]/3 p-4">
                                <p className="text-[11px] font-bold text-[#5B6E68] uppercase">
                                  Target Due Date
                                </p>
                                <p className="text-[14px] font-bold text-[#0F2D29] mt-1">
                                  {dueDate ?? "Not specified"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "tasks" && (
                        <div className="space-y-6">
                          <div className="rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-6 shadow-xs space-y-2 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8FE3C4]/30 text-[#0F8A65]">
                              <ListChecks size={24} />
                            </div>
                            <h3 className="text-[15px] font-bold text-[#0F2D29]">
                              {activeProject.tasks.length} Active Tasks Assigned
                            </h3>
                            <p className="text-[12.5px] text-[#5B6E68] max-w-md mx-auto">
                              Kanban board columns and task dependencies are
                              available in the Tasks view.
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-[15px] font-bold text-[#0F2D29] flex items-center gap-2">
                                <Flag size={18} className="text-[#0F8A65]" />
                                Sprints ({sprints.length})
                              </h3>
                              {canManage && (
                                <button
                                  onClick={() => setIsCreateSprintOpen(true)}
                                  className="flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#0F2D29]/90"
                                >
                                  <Plus size={14} />
                                  New Sprint
                                </button>
                              )}
                            </div>

                            {isLoadingSprints ? (
                              <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <ProjectRowSkeleton key={i} />
                                ))}
                              </div>
                            ) : isSprintsError ? (
                              <div className="flex flex-col items-center gap-2 py-8 text-center">
                                <AlertCircle
                                  size={22}
                                  className="text-red-500"
                                />
                                <p className="text-[13px] font-bold text-[#0F2D29]">
                                  Couldn't load sprints
                                </p>
                                <button
                                  onClick={() => refetchSprints()}
                                  className="mt-1 rounded-xl bg-[#0F2D29] px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#0F2D29]/90"
                                >
                                  Try again
                                </button>
                              </div>
                            ) : sprints.length === 0 ? (
                              <div className="py-8 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F2D29]/5 text-[#8FA69E]">
                                  <Flag size={22} />
                                </div>
                                <p className="text-[13px] font-semibold text-[#0F2D29]">
                                  No sprints planned yet
                                </p>
                                <p className="mt-1 text-[12px] text-[#5B6E68]">
                                  Break the work into sprints to track pace and
                                  goals.
                                </p>
                                {canManage && (
                                  <button
                                    onClick={() => setIsCreateSprintOpen(true)}
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-[#0F2D29]/90"
                                  >
                                    <Plus size={14} />
                                    Create your first sprint
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="divide-y divide-[#0F2D29]/6">
                                {sprints.map((s) => {
                                  const sStart = formatDate(s.startDate);
                                  const sEnd = formatDate(s.endDate);
                                  const sDaysRemaining = getDaysRemaining(
                                    s.endDate,
                                  );
                                  return (
                                    <div
                                      key={s.id}
                                      className="flex items-start justify-between gap-4 rounded-xl py-3.5 px-2 -mx-2 transition hover:bg-[#0F2D29]/3"
                                    >
                                      <div className="flex items-start gap-3 min-w-0">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8FE3C4]/25 text-[#0F8A65]">
                                          <Flag size={16} />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-[13.5px] font-bold text-[#0F2D29]">
                                            {s.name}
                                          </p>
                                          {s.goal && (
                                            <p className="mt-0.5 flex items-start gap-1 text-[12px] text-[#5B6E68]">
                                              <Target
                                                size={12}
                                                className="mt-0.5 shrink-0"
                                              />
                                              {s.goal.title}
                                            </p>
                                          )}
                                          <p className="mt-1 text-[11px] font-semibold text-[#8FA69E]">
                                            {sStart ?? "—"} → {sEnd ?? "—"}
                                          </p>
                                        </div>
                                      </div>

                                      {sDaysRemaining !== null && (
                                        <span
                                          className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold ${
                                            sDaysRemaining < 0
                                              ? "bg-[#0F2D29]/8 text-[#5B6E68]"
                                              : sDaysRemaining <= 3
                                                ? "bg-amber-50 text-amber-600"
                                                : "bg-[#0F8A65]/10 text-[#0F8A65]"
                                          }`}
                                        >
                                          <Clock size={12} />
                                          {sDaysRemaining < 0
                                            ? "Ended"
                                            : `${sDaysRemaining}d left`}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === "members" && (
                        <div className="rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-6 shadow-xs space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[15px] font-bold text-[#0F2D29] flex items-center gap-2">
                              <Users size={18} className="text-[#0F8A65]" />
                              Assigned Team Members (
                              {activeProject.members.length})
                            </h3>
                            {canManage && (
                              <button
                                onClick={() => setIsAddMemberOpen(true)}
                                className="flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#0F2D29]/90"
                              >
                                <UserPlus size={14} />
                                Add Member
                              </button>
                            )}
                          </div>

                          {activeProject.members.length === 0 ? (
                            <div className="py-8 text-center">
                              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F2D29]/5 text-[#8FA69E]">
                                <Users size={22} />
                              </div>
                              <p className="text-[13px] font-semibold text-[#0F2D29]">
                                Flying solo on this one
                              </p>
                              <p className="mt-1 text-[12px] text-[#5B6E68]">
                                Bring in teammates so work doesn't sit on one
                                person.
                              </p>
                              {canManage && (
                                <button
                                  onClick={() => setIsAddMemberOpen(true)}
                                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-[#0F2D29]/90"
                                >
                                  <UserPlus size={14} />
                                  Add your first member
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="divide-y divide-[#0F2D29]/6">
                              {activeProject.members.map((m, idx) => {
                                const u = resolveMemberUser(m);
                                const roleName =
                                  typeof m.role === "string"
                                    ? (rolesById.get(m.role) ?? "Member")
                                    : (m.role?.name ?? "Member");
                                const currentRoleId =
                                  typeof m.role === "string"
                                    ? m.role
                                    : m.role?.id;
                                const avatar = avatarColor(u?.name);
                                const isOwnerRow = !!u?.id && u.id === ownerId;
                                const isRowPending =
                                  !!u?.id && pendingMemberId === u.id;
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-xl py-3 px-2 -mx-2 transition hover:bg-[#0F2D29]/3"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold shadow-xs ring-2 ring-white"
                                        style={{
                                          backgroundColor: avatar.bg,
                                          color: avatar.fg,
                                        }}
                                      >
                                        {initials(u?.name)}
                                      </div>
                                      <div>
                                        <p className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#0F2D29]">
                                          {u?.name ?? "Member"}
                                          {isOwnerRow && (
                                            <Crown
                                              size={12}
                                              className="text-[#D97706]"
                                            />
                                          )}
                                        </p>
                                        <p className="text-[11.5px] text-[#5B6E68]">
                                          {u?.email ?? "—"}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {canManage && !isOwnerRow ? (
                                        <div className="relative">
                                          <select
                                            value={currentRoleId ?? ""}
                                            onChange={(e) =>
                                              u?.id &&
                                              handleRoleChange(
                                                u.id,
                                                e.target.value,
                                              )
                                            }
                                            disabled={isRowPending}
                                            className="appearance-none rounded-full border border-[#0F2D29]/15 bg-white pl-3 pr-7 py-1 text-[11px] font-bold capitalize text-[#0F2D29] outline-none transition focus:border-[#0F8A65] focus:ring-2 focus:ring-[#8FE3C4]/30 disabled:opacity-50"
                                          >
                                            {roles.map((r) => (
                                              <option key={r.id} value={r.id}>
                                                {r.name}
                                              </option>
                                            ))}
                                          </select>
                                          <ChevronRight
                                            size={11}
                                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[#8FA69E]"
                                          />
                                        </div>
                                      ) : (
                                        <span className="rounded-full bg-[#0F2D29]/8 px-3 py-1 text-[11px] font-bold capitalize text-[#0F2D29]">
                                          {roleName}
                                        </span>
                                      )}

                                      {canManage && !isOwnerRow && u?.id && (
                                        <button
                                          onClick={() =>
                                            handleRemoveMember(u.id, u.name)
                                          }
                                          disabled={isRowPending}
                                          title="Remove member"
                                          aria-label={`Remove ${u.name ?? "member"} from project`}
                                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                                        >
                                          {isRowPending ? (
                                            <Loader2
                                              size={14}
                                              className="animate-spin"
                                            />
                                          ) : (
                                            <Trash2 size={14} />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {isAddMemberOpen && (
                        <AddMemberModal
                          project={activeProject}
                          candidates={addableUsers}
                          roles={roles}
                          onClose={() => setIsAddMemberOpen(false)}
                        />
                      )}

                      {memberToDelete && (
                        <ConfirmDeleteMemberModal
                          userName={memberToDelete.userName}
                          projectName={activeProject.name}
                          isPending={pendingMemberId === memberToDelete.userId}
                          onConfirm={confirmRemoveMember}
                          onClose={() => setMemberToDelete(null)}
                        />
                      )}

                      {isCreateSprintOpen && (
                        <CreateSprintModal
                          projectId={activeProject.id}
                          projectName={activeProject.name}
                          goals={goals}
                          isLoadingGoals={isLoadingGoals}
                          onClose={() => setIsCreateSprintOpen(false)}
                        />
                      )}
                    </div>
                  );
                })()
              )}
            </section>
          </div>
        )}
      </main>

      <div
        className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const accent =
            t.type === "success"
              ? "#8FE3C4"
              : t.type === "warning"
                ? "#FBBF24"
                : "#60A5FA";
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-[#0F2D29]/20 bg-[#0F2D29] py-3 pr-4 pl-3.5 text-[13px] font-bold text-white shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-bottom-5"
              style={{ borderLeft: `3px solid ${accent}` }}
            >
              {t.type === "success" && (
                <CheckCircle2 size={18} className="shrink-0 text-[#8FE3C4]" />
              )}
              {t.type === "info" && (
                <Sparkles size={18} className="shrink-0 text-blue-300" />
              )}
              {t.type === "warning" && (
                <AlertCircle size={18} className="shrink-0 text-amber-300" />
              )}
              <span>{t.message}</span>
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((x) => x.id !== t.id))
                }
                aria-label="Dismiss notification"
                className="ml-2 text-white/50 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Projects;
