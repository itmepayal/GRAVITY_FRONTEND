import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Building2,
  Layers,
  Search,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Target,
  LayoutDashboard,
  Pencil,
  Trash2,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import {
  type Workspace,
  type Member,
  type Toast,
  nextId,
  WorkspaceListItem,
  WorkspaceDetail,
  CreateWorkspaceModal,
  type Role,
} from "@/components/workspace";
import { useCreateWorkspace } from "@/hooks/mutations/workspace/use-create-workspace";
import { useUpdateWorkspace } from "@/hooks/mutations/workspace/use-update-workspace";
import { useDeleteWorkspace } from "@/hooks/mutations/workspace/use-delete-workspace";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceById } from "@/hooks/queries/workspace/use-get-workspace-by-id";
import { useAddWorkspaceMember } from "@/hooks/mutations/workspace/use-add-workspace-member";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";
import { useRemoveWorkspaceMember } from "@/hooks/mutations/workspace/use-remove-workspace-member";
import { useUpdateWorkspaceMemberRole } from "@/hooks/mutations/workspace/update-workspace-member-role";
import { useGetWorkspaceGoals } from "@/hooks/queries/goal/get-workspace-goals";
import { useGetGoalById } from "@/hooks/queries/goal/use-get-goal-by-id";
import { useCreateGoal } from "@/hooks/mutations/goal/use-create-goal";
import { useUpdateGoal } from "@/hooks/mutations/goal/use-update-goal";
import { useDeleteGoal } from "@/hooks/mutations/goal/use-delete-goal";

const normalizeMember = (raw: any): Member => {
  const user = raw?.user ?? {};
  return {
    _id: raw._id ?? nextId("m"),
    user: {
      id: user._id ?? user.id ?? nextId("u"),
      name: user.name ?? raw.name ?? "Unknown",
      email: user.email ?? raw.email ?? "",
      avatar: user.avatar ?? raw.avatar ?? null,
    },
    role: raw.role ?? "member",
    joinedAt: raw.joinedAt ?? raw.createdAt ?? new Date().toISOString(),
  };
};

const normalizeUser = (raw: any) => ({
  id: raw._id ?? raw.id,
  name: raw.name ?? raw.email ?? "Unknown",
  email: raw.email ?? "",
  avatar: raw.avatar ?? null,
});

const normalizeWorkspace = (raw: any): Workspace => ({
  ...raw,
  _id: raw._id ?? raw.id,
  role: raw.role ?? "member",
  projects: raw.projects ?? [],
  members: (raw.members ?? []).map(normalizeMember),
  roles: raw.roles ?? [],
  activityLog: raw.activityLog ?? [],
});

// ── Goal helpers (mirrors the Goal mongoose schema's `status` enum) ────────
type GoalStatus =
  | "not_started"
  | "in_progress"
  | "at_risk"
  | "completed"
  | "cancelled";

const GOAL_STATUS_META: Record<
  GoalStatus,
  { label: string; color: string; bg: string }
> = {
  not_started: {
    label: "Not Started",
    color: "#5B6E68",
    bg: "rgba(91, 110, 104, 0.1)",
  },
  in_progress: {
    label: "In Progress",
    color: "#0F8A65",
    bg: "rgba(15, 138, 101, 0.1)",
  },
  at_risk: {
    label: "At Risk",
    color: "#D97706",
    bg: "rgba(217, 119, 6, 0.1)",
  },
  completed: {
    label: "Completed",
    color: "#2563EB",
    bg: "rgba(37, 99, 235, 0.1)",
  },
  cancelled: {
    label: "Cancelled",
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.1)",
  },
};

const GOAL_STATUS_OPTIONS = (Object.keys(GOAL_STATUS_META) as GoalStatus[]).map(
  (value) => ({ value, label: GOAL_STATUS_META[value].label }),
);

interface GoalOption {
  id: string;
  title: string;
  description?: string;
  status?: GoalStatus;
  progress?: number;
  targetDate?: string;
}

const normalizeGoalOption = (raw: any): GoalOption => ({
  id: raw._id ?? raw.id,
  // Goal schema field is `title` — `name` kept only as a defensive fallback.
  title: raw.title ?? raw.name ?? "Untitled Goal",
  description: raw.description ?? "",
  status: raw.status,
  progress: raw.progress,
  targetDate: raw.targetDate,
});

const formatGoalDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toDateInputValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const CreateGoalModal = ({
  workspaceId,
  workspaceName,
  onClose,
}: {
  workspaceId: string;
  workspaceName: string;
  onClose: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<GoalStatus>("not_started");
  const [targetDate, setTargetDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useCreateGoal();
  const queryClient = useQueryClient();

  useEffect(() => {
    titleInputRef.current?.focus();
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

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError("Goal title is required.");
      return;
    }
    if (trimmedTitle.length < 2) {
      setFormError("Goal title must be at least 2 characters.");
      return;
    }

    mutate(
      {
        workspaceId,
        data: {
          title: trimmedTitle,
          description: description.trim() || undefined,
          status,
          targetDate: targetDate || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["goals", workspaceId] });
          queryClient.invalidateQueries({ queryKey: ["workspace-goals"] });
          onClose();
        },
        onError: () => {
          setFormError(
            "Couldn't create goal. A goal with this title may already exist.",
          );
        },
      },
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md transition-all animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workspace-goal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[#0F2D29]/15 bg-white shadow-2xl transition-all">
        <div className="flex items-start justify-between gap-4 p-6 pb-0 sm:p-7 sm:pb-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8FE3C4]/30 ring-1 ring-[#8FE3C4]/50 text-[#0F8A65]">
              <Target size={20} />
            </div>
            <div>
              <h2
                id="create-workspace-goal-title"
                className="text-[16px] font-bold text-[#0F2D29]"
              >
                New Goal
              </h2>
              <p className="text-[12px] text-[#5B6E68]">
                Set a goal for{" "}
                <span className="font-semibold text-[#0F2D29]">
                  {workspaceName}
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

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 overflow-y-auto px-6 pb-6 sm:px-7 sm:pb-7"
        >
          <div>
            <label
              htmlFor="ws-goal-title"
              className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider"
            >
              Goal Title
            </label>
            <input
              ref={titleInputRef}
              id="ws-goal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              maxLength={100}
              placeholder="e.g. Grow active users by 20%"
              className="w-full rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-3 text-[13px] font-medium text-[#0F2D29] outline-none transition placeholder:text-[#8FA69E] focus:border-[#0F8A65] focus:bg-white focus:ring-2 focus:ring-[#8FE3C4]/30 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="ws-goal-description"
              className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider"
            >
              Description{" "}
              <span className="normal-case font-medium text-[#8FA69E]">
                (optional)
              </span>
            </label>
            <textarea
              id="ws-goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={3}
              maxLength={1000}
              placeholder="What does success look like for this goal?"
              className="w-full resize-none rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-3 text-[13px] font-medium text-[#0F2D29] outline-none transition placeholder:text-[#8FA69E] focus:border-[#0F8A65] focus:bg-white focus:ring-2 focus:ring-[#8FE3C4]/30 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    disabled={isPending}
                    className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition disabled:opacity-50 ${
                      isSelected
                        ? "border-[#0F8A65] bg-[#0F8A65]/10 text-[#0F2D29] ring-1 ring-[#0F8A65]"
                        : "border-[#0F2D29]/10 bg-white text-[#5B6E68] hover:bg-[#0F2D29]/3 hover:text-[#0F2D29]"
                    }`}
                  >
                    <span className="text-[11.5px] font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="ws-goal-target-date"
              className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider"
            >
              Target Date{" "}
              <span className="normal-case font-medium text-[#8FA69E]">
                (optional)
              </span>
            </label>
            <input
              id="ws-goal-target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              disabled={isPending}
              className="w-full rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3 py-2.5 text-[13px] font-medium text-[#0F2D29] outline-none transition focus:border-[#0F8A65] focus:bg-white focus:ring-2 focus:ring-[#8FE3C4]/30 disabled:opacity-50"
            />
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
                  Create Goal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

const EditGoalModal = ({
  goal,
  workspaceId,
  workspaceName,
  onClose,
}: {
  goal: GoalOption;
  workspaceId: string;
  workspaceName: string;
  onClose: () => void;
}) => {
  const { data: goalResponse, isLoading: isLoadingGoal } = useGetGoalById(
    goal.id,
  );

  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description ?? "");
  const [status, setStatus] = useState<GoalStatus>(
    goal.status ?? "not_started",
  );
  const [targetDate, setTargetDate] = useState(
    toDateInputValue(goal.targetDate),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUpdateGoal();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!goalResponse) return;
    const raw = (goalResponse as any)?.data ?? goalResponse;
    const fresh = normalizeGoalOption(raw);
    setTitle(fresh.title);
    setDescription(fresh.description ?? "");
    setStatus(fresh.status ?? "not_started");
    setTargetDate(toDateInputValue(fresh.targetDate));
  }, [goalResponse]);

  useEffect(() => {
    titleInputRef.current?.focus();
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

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError("Goal title is required.");
      return;
    }
    if (trimmedTitle.length < 2) {
      setFormError("Goal title must be at least 2 characters.");
      return;
    }

    mutate(
      {
        goalId: goal.id,
        data: {
          title: trimmedTitle,
          description: description.trim() || undefined,
          status,
          targetDate: targetDate || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["goals", workspaceId] });
          queryClient.invalidateQueries({ queryKey: ["workspace-goals"] });
          onClose();
        },
        onError: () => {
          setFormError(
            "Couldn't update goal. A goal with this title may already exist.",
          );
        },
      },
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md transition-all animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-workspace-goal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[#0F2D29]/15 bg-white shadow-2xl transition-all">
        <div className="flex items-start justify-between gap-4 p-6 pb-0 sm:p-7 sm:pb-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8FE3C4]/30 ring-1 ring-[#8FE3C4]/50 text-[#0F8A65]">
              <Pencil size={20} />
            </div>
            <div>
              <h2
                id="edit-workspace-goal-title"
                className="text-[16px] font-bold text-[#0F2D29]"
              >
                Edit Goal
              </h2>
              <p className="text-[12px] text-[#5B6E68]">
                Update goal for{" "}
                <span className="font-semibold text-[#0F2D29]">
                  {workspaceName}
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

        {isLoadingGoal ? (
          <div className="flex items-center justify-center gap-2 px-6 py-14 sm:px-7">
            <Loader2 size={18} className="animate-spin text-[#0F8A65]" />
            <span className="text-[12.5px] font-medium text-[#5B6E68]">
              Loading goal…
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 overflow-y-auto px-6 pb-6 sm:px-7 sm:pb-7"
          >
            <div>
              <label
                htmlFor="ws-goal-edit-title"
                className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider"
              >
                Goal Title
              </label>
              <input
                ref={titleInputRef}
                id="ws-goal-edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending}
                maxLength={100}
                placeholder="e.g. Grow active users by 20%"
                className="w-full rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-3 text-[13px] font-medium text-[#0F2D29] outline-none transition placeholder:text-[#8FA69E] focus:border-[#0F8A65] focus:bg-white focus:ring-2 focus:ring-[#8FE3C4]/30 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="ws-goal-edit-description"
                className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider"
              >
                Description{" "}
                <span className="normal-case font-medium text-[#8FA69E]">
                  (optional)
                </span>
              </label>
              <textarea
                id="ws-goal-edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                rows={3}
                maxLength={1000}
                placeholder="What does success look like for this goal?"
                className="w-full resize-none rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-3 text-[13px] font-medium text-[#0F2D29] outline-none transition placeholder:text-[#8FA69E] focus:border-[#0F8A65] focus:bg-white focus:ring-2 focus:ring-[#8FE3C4]/30 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GOAL_STATUS_OPTIONS.map((opt) => {
                  const isSelected = status === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setStatus(opt.value)}
                      disabled={isPending}
                      className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition disabled:opacity-50 ${
                        isSelected
                          ? "border-[#0F8A65] bg-[#0F8A65]/10 text-[#0F2D29] ring-1 ring-[#0F8A65]"
                          : "border-[#0F2D29]/10 bg-white text-[#5B6E68] hover:bg-[#0F2D29]/3 hover:text-[#0F2D29]"
                      }`}
                    >
                      <span className="text-[11.5px] font-bold">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="ws-goal-edit-target-date"
                className="mb-2 block text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider"
              >
                Target Date{" "}
                <span className="normal-case font-medium text-[#8FA69E]">
                  (optional)
                </span>
              </label>
              <input
                id="ws-goal-edit-target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                disabled={isPending}
                className="w-full rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3 py-2.5 text-[13px] font-medium text-[#0F2D29] outline-none transition focus:border-[#0F8A65] focus:bg-white focus:ring-2 focus:ring-[#8FE3C4]/30 disabled:opacity-50"
              />
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
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
};

// ── Delete Goal confirm modal — type-to-confirm, same pattern used for
//    removing a project member ────────────────────────────────────────────
const DeleteGoalModal = ({
  goal,
  onClose,
}: {
  goal: GoalOption;
  onClose: () => void;
}) => {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useDeleteGoal();
  const queryClient = useQueryClient();
  const isMatch =
    confirmText.trim().toLowerCase() === goal.title.trim().toLowerCase();

  useEffect(() => {
    inputRef.current?.focus();
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
    if (!isMatch || isPending) return;

    mutate(goal.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["workspace-goals"] });
        onClose();
      },
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md transition-all animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-workspace-goal-title"
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
              id="delete-workspace-goal-title"
              className="text-[16px] font-bold text-[#0F2D29]"
            >
              Delete Goal?
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-[#5B6E68]">
              This will permanently delete{" "}
              <span className="font-bold text-[#0F2D29]">{goal.title}</span>.
              This action cannot be undone.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="delete-goal-confirm-input"
            className="mb-2 block text-[12px] font-bold text-[#0F2D29]"
          >
            Type{" "}
            <span className="rounded bg-red-50 px-1.5 py-0.5 font-mono text-[12px] text-red-700">
              {goal.title}
            </span>{" "}
            to confirm
          </label>
          <input
            ref={inputRef}
            id="delete-goal-confirm-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isPending}
            autoComplete="off"
            placeholder={goal.title}
            className="w-full rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-2.5 text-[13px] font-medium text-[#0F2D29] outline-none transition placeholder:text-[#8FA69E] focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:opacity-50"
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
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  Delete Goal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

// ── Workspace Goals panel — lists workspace goals + create, edit, delete ──
const WorkspaceGoalsPanel = ({
  workspaceId,
  workspaceName,
  canManage,
}: {
  workspaceId: string;
  workspaceName: string;
  canManage: boolean;
}) => {
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalOption | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<GoalOption | null>(null);
  const { data: goalsResponse, isLoading: isLoadingGoals } =
    useGetWorkspaceGoals(workspaceId);

  const goals: GoalOption[] = useMemo(() => {
    const raw = Array.isArray(goalsResponse)
      ? goalsResponse
      : (goalsResponse?.data ?? []);
    return raw.map(normalizeGoalOption);
  }, [goalsResponse]);

  return (
    <div className="mt-6 rounded-2xl border border-[#0F2D29]/10 bg-white/90 p-6 shadow-[0_2px_12px_rgba(15,45,41,0.05)] backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[#0F2D29] flex items-center gap-2">
          <Target size={18} className="text-[#0F8A65]" />
          Workspace Goals ({goals.length})
        </h3>
        {canManage && (
          <button
            onClick={() => setIsCreateGoalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#0F2D29]/90"
          >
            <Plus size={14} />
            New Goal
          </button>
        )}
      </div>

      {isLoadingGoals ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl p-3.5 bg-[#0F2D29]/5 animate-pulse"
            >
              <div className="h-9 w-9 shrink-0 rounded-xl bg-[#0F2D29]/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded-md bg-[#0F2D29]/10" />
                <div className="h-3 w-1/2 rounded-md bg-[#0F2D29]/8" />
              </div>
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F2D29]/5 text-[#8FA69E]">
            <Target size={22} />
          </div>
          <p className="text-[13px] font-semibold text-[#0F2D29]">
            No goals set yet
          </p>
          <p className="mt-1 text-[12px] text-[#5B6E68]">
            Add a goal so the whole workspace has something concrete to point
            at.
          </p>
          {canManage && (
            <button
              onClick={() => setIsCreateGoalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-[#0F2D29]/90"
            >
              <Plus size={14} />
              Create your first goal
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-[#0F2D29]/6">
          {goals.map((g) => {
            const gMeta =
              (g.status && GOAL_STATUS_META[g.status]) ??
              GOAL_STATUS_META.not_started;
            const targetDate = formatGoalDate(g.targetDate);
            return (
              <div
                key={g.id}
                className="flex items-center justify-between gap-4 rounded-xl py-3.5 px-2 -mx-2 transition hover:bg-[#0F2D29]/3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8FE3C4]/25 text-[#0F8A65]">
                    <Target size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-bold text-[#0F2D29]">
                      {g.title}
                    </p>
                    {g.description && (
                      <p className="mt-0.5 truncate text-[11.5px] text-[#5B6E68]">
                        {g.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-3">
                      {typeof g.progress === "number" && (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#0F2D29]/8">
                            <div
                              className="h-full rounded-full bg-[#0F8A65]"
                              style={{ width: `${g.progress}%` }}
                            />
                          </div>
                          <span className="text-[10.5px] font-semibold text-[#8FA69E]">
                            {g.progress}%
                          </span>
                        </div>
                      )}
                      {targetDate && (
                        <span className="text-[10.5px] font-semibold text-[#8FA69E]">
                          Target {targetDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{
                      backgroundColor: gMeta.bg,
                      color: gMeta.color,
                    }}
                  >
                    {gMeta.label}
                  </span>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingGoal(g)}
                        title="Edit goal"
                        aria-label={`Edit ${g.title}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[#5B6E68] transition hover:bg-[#0F2D29]/8 hover:text-[#0F2D29]"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingGoal(g)}
                        title="Delete goal"
                        aria-label={`Delete ${g.title}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isCreateGoalOpen && (
        <CreateGoalModal
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          onClose={() => setIsCreateGoalOpen(false)}
        />
      )}

      {editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          onClose={() => setEditingGoal(null)}
        />
      )}

      {deletingGoal && (
        <DeleteGoalModal
          goal={deletingGoal}
          onClose={() => setDeletingGoal(null)}
        />
      )}
    </div>
  );
};

const Workspaces = () => {
  const { openMobileNav } = useDashboardContext();
  const queryClient = useQueryClient();

  const { mutate: createWorkspace, isPending: isCreatingWorkspace } =
    useCreateWorkspace();
  const { mutate: updateWorkspaceMutation, isPending: isUpdatingWorkspace } =
    useUpdateWorkspace();
  const { mutate: deleteWorkspaceMutation, isPending: isDeletingWorkspace } =
    useDeleteWorkspace();
  const {
    data: workspacesResponse,
    isLoading: isLoadingWorkspaces,
    isError: isWorkspacesError,
  } = useGetUserWorkspaces();
  const { mutate: addWorkspaceMemberMutation, isPending: isAddingMember } =
    useAddWorkspaceMember();
  const { mutate: removeWorkspaceMemberMutation, isPending: isRemovingMember } =
    useRemoveWorkspaceMember();
  const { mutate: updateMemberRoleMutation, isPending: isUpdatingMemberRole } =
    useUpdateWorkspaceMemberRole();
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetAllUsers();
  const users = useMemo(() => {
    const raw = Array.isArray(usersResponse)
      ? usersResponse
      : (usersResponse ?? []);
    return raw.map(normalizeUser);
  }, [usersResponse]);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Top-level section switch for the detail panel: the existing
  // WorkspaceDetail card (Projects/Members/Roles/Activity) vs the new
  // workspace-level Goals panel.
  const [activeSection, setActiveSection] = useState<"workspace" | "goals">(
    "workspace",
  );

  const {
    data: activeWorkspaceResponse,
    isLoading: isLoadingActiveWorkspace,
    isFetching: isFetchingActiveWorkspace,
    isError: isActiveWorkspaceError,
  } = useGetWorkspaceById(activeId ?? "");

  useEffect(() => {
    const raw = Array.isArray(workspacesResponse)
      ? workspacesResponse
      : (workspacesResponse?.data ?? []);

    const normalized = raw.map(normalizeWorkspace);
    setWorkspaces(normalized);

    setActiveId((cur) => {
      if (cur && normalized.some((w) => w._id === cur)) return cur;
      return normalized[0]?._id ?? null;
    });
  }, [workspacesResponse]);

  useEffect(() => {
    if (!activeWorkspaceResponse) return;

    const raw = activeWorkspaceResponse?.data ?? activeWorkspaceResponse;
    const normalized = normalizeWorkspace(raw);

    setWorkspaces((prev) =>
      prev.map((w) => (w._id === normalized._id ? { ...w, ...normalized } : w)),
    );
  }, [activeWorkspaceResponse]);

  const addToast = (type: "success" | "info" | "warning", message: string) => {
    const id = nextId("tst");
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const activeWorkspace = workspaces.find((w) => w._id === activeId) ?? null;

  // Same role check pattern used on the Projects page — owner/admin can manage.
  const canManageActiveWorkspace =
    activeWorkspace?.role === "owner" || activeWorkspace?.role === "admin";

  const totals = useMemo(
    () => ({
      projects: workspaces.reduce((n, w) => n + (w.projects?.length ?? 0), 0),
      members: workspaces.reduce((n, w) => n + (w.members?.length ?? 0), 0),
    }),
    [workspaces],
  );

  const filtered = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      w.description?.toLowerCase().includes(query.toLowerCase()),
  );

  const handleCreated = (ws: Workspace) => {
    const safeWs = normalizeWorkspace(ws);
    setWorkspaces((prev) => [safeWs, ...prev]);
    setActiveId(safeWs._id);
    setShowCreate(false);
    addToast("success", `Workspace "${safeWs.name}" created successfully!`);
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });
  };

  const handleCreateError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Failed to create workspace.";
    addToast("warning", message);
  };

  const handleDeleted = (id: string) => {
    const wsToDelete = workspaces.find((w) => w._id === id);
    const wsName = wsToDelete?.name || "Workspace";
    const previousWorkspaces = workspaces;

    setDeletingId(id);

    deleteWorkspaceMutation(id, {
      onSuccess: () => {
        setWorkspaces((prev) => prev.filter((w) => w._id !== id));
        setActiveId((cur) => (cur === id ? null : cur));
        addToast("info", `Deleted "${wsName}".`);
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      },
      onError: () => {
        setWorkspaces(previousWorkspaces);
      },
      onSettled: () => {
        setDeletingId(null);
      },
    });
  };

  const patchWorkspace = (id: string, patch: Partial<Workspace>) => {
    const previous = workspaces.find((w) => w._id === id);
    setWorkspaces((prev) =>
      prev.map((w) => (w._id === id ? { ...w, ...patch } : w)),
    );

    const { name, description, color, icon, isPrivate } = patch;
    const apiPayload: {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      isPrivate?: boolean;
    } = {};
    if (name !== undefined) apiPayload.name = name;
    if (description !== undefined) apiPayload.description = description;
    if (color !== undefined) apiPayload.color = color;
    if (icon !== undefined) apiPayload.icon = icon;
    if (isPrivate !== undefined) apiPayload.isPrivate = isPrivate;
    if (Object.keys(apiPayload).length === 0) return;

    updateWorkspaceMutation(
      { workspaceId: id, data: apiPayload },
      {
        onSuccess: (response: any) => {
          const updated = response?.data ?? response;
          if (updated) {
            setWorkspaces((prev) =>
              prev.map((w) =>
                w._id === id ? normalizeWorkspace({ ...w, ...updated }) : w,
              ),
            );
          }
          queryClient.invalidateQueries({ queryKey: ["workspaces"] });
          queryClient.invalidateQueries({ queryKey: ["workspace", id] });
        },
        onError: () => {
          if (previous) {
            setWorkspaces((prev) =>
              prev.map((w) => (w._id === id ? previous : w)),
            );
          }
        },
      },
    );
  };

  const addActivity = (
    wsId: string,
    action: string,
    target: string,
    iconType: "project" | "member" | "role" | "workspace",
  ) => {
    const newAct = {
      id: nextId("act"),
      user: "You",
      action,
      target,
      timestamp: "Just now",
      iconType,
    };
    setWorkspaces((prev) =>
      prev.map((w) =>
        w._id === wsId
          ? { ...w, activityLog: [newAct, ...(w.activityLog || [])] }
          : w,
      ),
    );
  };

  const handleAddMember = (
    workspaceId: string,
    memberData: { userId: string; role: string },
  ) => {
    addWorkspaceMemberMutation(
      { workspaceId, data: memberData },
      {
        onSuccess: (response: any) => {
          const newMember = response?.data ?? response;
          if (newMember) {
            setWorkspaces((prev) =>
              prev.map((w) =>
                w._id === workspaceId
                  ? {
                      ...w,
                      members: [...w.members, normalizeMember(newMember)],
                    }
                  : w,
              ),
            );
            addActivity(
              workspaceId,
              "added a teammate",
              newMember?.user?.name ??
                newMember?.user?.email ??
                memberData.userId,
              "member",
            );
            addToast("success", "Teammate added successfully!");
          }
          queryClient.invalidateQueries({ queryKey: ["workspaces"] });
          queryClient.invalidateQueries({
            queryKey: ["workspace", workspaceId],
          });
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Failed to add teammate.";
          addToast("warning", message);
        },
      },
    );
  };

  const handleUpdateMemberRole = (
    workspaceId: string,
    memberId: string,
    newRole: Role,
    memberLabel: string,
  ) => {
    const previousWorkspaces = workspaces;

    setWorkspaces((prev) =>
      prev.map((w) =>
        w._id === workspaceId
          ? {
              ...w,
              members: w.members.map((m) =>
                m.user.id === memberId ? { ...m, role: newRole } : m,
              ),
            }
          : w,
      ),
    );

    updateMemberRoleMutation(
      {
        workspaceId,
        userId: memberId,
        data: { role: newRole },
      },
      {
        onSuccess: () => {
          addActivity(
            workspaceId,
            `changed role to ${newRole}`,
            memberLabel,
            "member",
          );

          addToast("info", `Updated role for ${memberLabel}`);

          queryClient.invalidateQueries({
            queryKey: ["workspaces"],
          });

          queryClient.invalidateQueries({
            queryKey: ["workspace", workspaceId],
          });
        },

        onError: () => {
          setWorkspaces(previousWorkspaces);
        },
      },
    );
  };

  const handleRemoveMember = (
    workspaceId: string,
    memberId: string,
    memberLabel: string,
  ) => {
    const previousWorkspaces = workspaces;
    removeWorkspaceMemberMutation(
      {
        workspaceId,
        userId: memberId,
      },
      {
        onSuccess: () => {
          setWorkspaces((prev) =>
            prev.map((w) =>
              w._id === workspaceId
                ? {
                    ...w,
                    members: w.members.filter((m) => m.user.id !== memberId),
                  }
                : w,
            ),
          );

          addActivity(workspaceId, "removed member", memberLabel, "member");
          addToast("warning", `Removed ${memberLabel}`);
          queryClient.invalidateQueries({
            queryKey: ["workspaces"],
          });
          queryClient.invalidateQueries({
            queryKey: ["workspace", workspaceId],
          });
        },
        onError: () => {
          setWorkspaces(previousWorkspaces);
        },
      },
    );
  };

  useEffect(() => {
    setActiveSection("workspace");
  }, [activeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        document.getElementById("workspace-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Topbar
        title="Workspaces"
        subtitle={`${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"} · ${totals.projects} projects · ${totals.members} teammates`}
        onMenuClick={openMobileNav}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex max-w-8xl flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-80 xl:w-84">
            <div className="overflow-hidden rounded-2xl border border-[#0F2D29]/10 bg-white/90 shadow-[0_2px_12px_rgba(15,45,41,0.05)] backdrop-blur-md">
              <div className="border-b border-[#0F2D29]/6 bg-linear-to-br from-[#8FE3C4]/10 via-transparent to-[#0F2D29]/2 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8FE3C4]/25 ring-1 ring-[#8FE3C4]/40">
                      <Layers size={17} className="text-[#0F8A65]" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-bold text-[#0F2D29]">
                        Workspaces
                      </p>
                      <p className="text-[11px] text-[#5B6E68]">
                        {workspaces.length} active spaces
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F2D29] text-white shadow-sm transition hover:scale-105 hover:bg-[#0F2D29]/90 active:scale-95 focus-visible:outline-none"
                    aria-label="Create workspace"
                    title="Create workspace"
                  >
                    <Plus size={17} />
                  </button>
                </div>

                {workspaces.length > 0 && (
                  <div className="relative mt-3.5">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
                    />
                    <input
                      id="workspace-search-input"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search spaces... (Press '/' to focus)"
                      className="w-full rounded-xl border border-[#0F2D29]/10 bg-white py-2 pr-8 pl-9 text-[12.5px] text-[#0F2D29] outline-none placeholder:text-[#8FA69E] focus:border-[#8FE3C4] focus:ring-2 focus:ring-[#8FE3C4]/20 transition"
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E] hover:text-[#0F2D29]"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isLoadingWorkspaces ? (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-14">
                  <Loader2 size={20} className="animate-spin text-[#0F8A65]" />
                  <p className="text-[12px] text-[#5B6E68]">
                    Loading workspaces...
                  </p>
                </div>
              ) : isWorkspacesError ? (
                <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
                  <AlertCircle size={20} className="text-red-500" />
                  <p className="text-[12.5px] font-medium text-[#0F2D29]">
                    Couldn't load workspaces
                  </p>
                  <p className="text-[11px] text-[#8FA69E]">
                    Please refresh the page to try again.
                  </p>
                </div>
              ) : workspaces.length === 0 ? (
                <SidebarEmpty onCreate={() => setShowCreate(true)} />
              ) : (
                <ul className="max-h-[min(560px,64vh)] space-y-1.5 overflow-y-auto p-2">
                  {filtered.length === 0 ? (
                    <li className="px-3 py-10 text-center">
                      <Search
                        size={22}
                        className="mx-auto mb-2 text-[#8FA69E]/50"
                      />
                      <p className="text-[12.5px] font-medium text-[#5B6E68]">
                        No matches found
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#8FA69E]">
                        Try searching another term
                      </p>
                    </li>
                  ) : (
                    filtered.map((ws) => (
                      <WorkspaceListItem
                        key={ws._id}
                        workspace={ws}
                        active={ws._id === activeId}
                        onSelect={() => setActiveId(ws._id)}
                      />
                    ))
                  )}
                </ul>
              )}
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            {isLoadingWorkspaces ? (
              <div className="flex min-h-115 items-center justify-center rounded-2xl border border-dashed border-[#0F2D29]/15 bg-white/80">
                <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
              </div>
            ) : !activeWorkspace ? (
              <EmptyPanel onCreate={() => setShowCreate(true)} />
            ) : isLoadingActiveWorkspace ? (
              <div className="flex min-h-115 items-center justify-center rounded-2xl border border-dashed border-[#0F2D29]/15 bg-white/80">
                <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
              </div>
            ) : isActiveWorkspaceError ? (
              <div className="flex min-h-115 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0F2D29]/15 bg-white/80 text-center">
                <AlertCircle size={22} className="text-red-500" />
                <p className="text-[13.5px] font-medium text-[#0F2D29]">
                  Couldn't load this workspace
                </p>
                <p className="text-[12px] text-[#8FA69E]">
                  Please try selecting it again.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 inline-flex items-center gap-1 rounded-xl border border-[#0F2D29]/10 bg-white/90 p-1 shadow-[0_2px_12px_rgba(15,45,41,0.05)] backdrop-blur-md">
                  <button
                    onClick={() => setActiveSection("workspace")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-bold transition ${
                      activeSection === "workspace"
                        ? "bg-[#0F2D29] text-white shadow-xs"
                        : "text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
                    }`}
                  >
                    <LayoutDashboard size={15} />
                    Workspace
                  </button>
                  <button
                    onClick={() => setActiveSection("goals")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-bold transition ${
                      activeSection === "goals"
                        ? "bg-[#0F2D29] text-white shadow-xs"
                        : "text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
                    }`}
                  >
                    <Target size={15} />
                    Goals
                  </button>
                </div>

                {activeSection === "workspace" ? (
                  <WorkspaceDetail
                    key={activeWorkspace._id}
                    workspace={activeWorkspace}
                    isRefreshing={
                      isFetchingActiveWorkspace || isUpdatingWorkspace
                    }
                    isDeleting={
                      isDeletingWorkspace && deletingId === activeWorkspace._id
                    }
                    onUpdated={(patch) =>
                      patchWorkspace(activeWorkspace._id, patch)
                    }
                    onDeleted={() => handleDeleted(activeWorkspace._id)}
                    onAddMember={(memberData) =>
                      handleAddMember(activeWorkspace._id, memberData)
                    }
                    isAddingMember={isAddingMember}
                    onRemoveMember={(memberId, memberLabel) =>
                      handleRemoveMember(
                        activeWorkspace._id,
                        memberId,
                        memberLabel,
                      )
                    }
                    isRemovingMember={isRemovingMember}
                    users={users}
                    isLoadingUsers={isLoadingUsers}
                    addActivity={(action, target, iconType) =>
                      addActivity(activeWorkspace._id, action, target, iconType)
                    }
                    addToast={addToast}
                    onUpdateMemberRole={(memberId, newRole, memberLabel) =>
                      handleUpdateMemberRole(
                        activeWorkspace._id,
                        memberId,
                        newRole,
                        memberLabel,
                      )
                    }
                    isUpdatingMemberRole={isUpdatingMemberRole}
                  />
                ) : (
                  <WorkspaceGoalsPanel
                    workspaceId={activeWorkspace._id}
                    workspaceName={activeWorkspace.name}
                    canManage={canManageActiveWorkspace}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {showCreate && (
        <CreateWorkspaceModal
          onClose={() => setShowCreate(false)}
          isSubmitting={isCreatingWorkspace}
          onCreated={(ws) => {
            createWorkspace(ws, {
              onSuccess: (response: any) => {
                const savedWorkspace = response?.data ?? response;
                handleCreated({ ...ws, ...savedWorkspace });
              },
              onError: (error: unknown) => {
                handleCreateError(error);
              },
            });
          }}
        />
      )}

      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29] px-4 py-3 text-[13px] font-medium text-white shadow-xl backdrop-blur-md"
          >
            {t.type === "success" && (
              <CheckCircle2 size={16} className="text-[#8FE3C4]" />
            )}
            {t.type === "info" && (
              <Sparkles size={16} className="text-[#93C5FD]" />
            )}
            {t.type === "warning" && (
              <AlertCircle size={16} className="text-[#FCD34D]" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const SidebarEmpty = ({ onCreate }: { onCreate: () => void }) => (
  <div className="px-4 py-10 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8FE3C4]/20">
      <Building2 size={22} className="text-[#0F8A65]" />
    </div>
    <p className="text-[13.5px] font-bold text-[#0F2D29]">No workspaces yet</p>
    <p className="mt-1 text-[12px] text-[#5B6E68]">
      Create your first space to organize projects and teammates.
    </p>
    <button
      onClick={onCreate}
      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-medium text-white shadow-sm transition hover:bg-[#0F2D29]/90"
    >
      <Plus size={14} />
      Create workspace
    </button>
  </div>
);

const EmptyPanel = ({ onCreate }: { onCreate: () => void }) => (
  <div className="relative flex min-h-115 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#0F2D29]/15 bg-white/80 px-6 py-16 text-center shadow-xs">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(143,227,196,0.15),transparent_60%)]" />
    <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8FE3C4]/20 ring-1 ring-[#8FE3C4]/40">
      <Building2 size={28} className="text-[#0F8A65]" />
    </div>
    <h2 className="relative text-[18px] font-bold tracking-tight text-[#0F2D29]">
      Select a Workspace
    </h2>
    <p className="relative mt-2 max-w-sm text-[13px] leading-relaxed text-[#5B6E68]">
      Choose a workspace from the sidebar to manage projects, teammates, custom
      roles, and activity logs — or create a brand new space.
    </p>
    <button
      onClick={onCreate}
      className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F2D29] px-5 py-2.5 text-[13px] font-medium text-white shadow-md transition hover:bg-[#0F2D29]/90 hover:shadow-lg"
    >
      <Sparkles size={15} />
      Create workspace
    </button>
  </div>
);

export default Workspaces;
