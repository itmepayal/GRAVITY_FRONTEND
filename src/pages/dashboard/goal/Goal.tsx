import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useSyncedWorkspace } from "@/hooks/useSyncedWorkspace";
import { useGetWorkspaceGoals } from "@/hooks/queries/goal/get-workspace-goals";
import { useCreateGoal } from "@/hooks/mutations/goal/use-create-goal";
import { useUpdateGoal } from "@/hooks/mutations/goal/use-update-goal";
import { useDeleteGoal } from "@/hooks/mutations/goal/use-delete-goal";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import {
  FONT_GOLDMAN,
  FONT_POPPINS,
  COMMON_CLASSES,
} from "@/components/common/design-system";

import {
  Target,
  Building2,
  Search,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  TrendingUp,
  Pencil,
  Trash2,
  X,
  Calendar,
  AlertTriangle,
} from "lucide-react";

export function Goal() {
  const { openMobileNav } = useDashboardContext();

  const {
    workspaces,
    currentWorkspaceId: selectedWorkspaceId,
    setCurrentWorkspaceId: setSelectedWorkspaceId,
    isLoadingWorkspaces,
  } = useSyncedWorkspace();

  // 2. Fetch Workspace Goals
  const {
    data: goalsResponse,
    isLoading: isLoadingGoals,
    isRefetching,
    refetch,
  } = useGetWorkspaceGoals(selectedWorkspaceId);

  const goals = goalsResponse?.data || [];

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredGoals = useMemo(() => {
    return goals.filter((g: any) => {
      const matchesSearch =
        !searchQuery.trim() ||
        g.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || g.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [goals, searchQuery, statusFilter]);

  // Metrics Calculations
  const activeWorkspaceName =
    workspaces.find((w: any) => (w._id || w.id) === selectedWorkspaceId)
      ?.name ?? "Workspace";

  const completedCount = useMemo(
    () => goals.filter((g: any) => g.status === "completed").length,
    [goals],
  );

  const inProgressCount = useMemo(
    () => goals.filter((g: any) => g.status === "in_progress").length,
    [goals],
  );

  const avgProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const total = goals.reduce(
      (sum: number, g: any) => sum + (g.progress || 0),
      0,
    );
    return Math.round(total / goals.length);
  }, [goals]);

  const metricCards = [
    {
      title: "Workspace Goals",
      value: goals.length,
      subtitle: `${activeWorkspaceName} OKR targets`,
      icon: Target,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "In Progress",
      value: inProgressCount,
      subtitle: "Active key result tracking",
      icon: Clock,
      accentColor: "#D97706",
      bgGradient: "from-[#D97706]/10 to-transparent",
    },
    {
      title: "Completed",
      value: completedCount,
      subtitle: "Achieved OKRs",
      icon: CheckCircle2,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Avg Progress",
      value: `${avgProgress}%`,
      subtitle: "Overall goal completion rate",
      icon: TrendingUp,
      accentColor: "#6366F1",
      bgGradient: "from-[#6366F1]/10 to-transparent",
    },
  ];

  // Mutations
  const { mutate: createGoal, isPending: isCreating } = useCreateGoal();
  const { mutate: updateGoal, isPending: isUpdating } = useUpdateGoal();
  const { mutate: deleteGoal, isPending: isDeleting } = useDeleteGoal();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("not_started");
  const [progress, setProgress] = useState<number>(0);
  const [targetDate, setTargetDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const resetForm = () => {
    setEditingGoalId(null);
    setTitle("");
    setDescription("");
    setStatus("not_started");
    setProgress(0);
    setTargetDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    );
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditGoal = (g: any) => {
    setEditingGoalId(g._id || g.id);
    setTitle(g.title || "");
    setDescription(g.description || "");
    setStatus(g.status || "not_started");
    setProgress(g.progress || 0);
    if (g.targetDate)
      setTargetDate(new Date(g.targetDate).toISOString().split("T")[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedWorkspaceId) return;

    if (editingGoalId) {
      updateGoal(
        {
          goalId: editingGoalId,
          data: {
            title: title.trim(),
            description: description.trim(),
            status: status as any,
            progress: Number(progress),
            targetDate: new Date(targetDate).toISOString(),
          },
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            resetForm();
            refetch();
          },
        },
      );
    } else {
      createGoal(
        {
          workspaceId: selectedWorkspaceId,
          data: {
            title: title.trim(),
            description: description.trim(),
            targetDate: new Date(targetDate).toISOString(),
          },
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            resetForm();
            refetch();
          },
        },
      );
    }
  };

  const handleDeleteClick = (g: any) => {
    setDeleteTarget({ id: g._id || g.id, title: g.title });
    setDeleteConfirmText("");
  };

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteConfirmText("");
  };

  const isDeleteConfirmed =
    deleteTarget !== null &&
    deleteConfirmText.trim() === deleteTarget.title.trim();

  const handleConfirmDelete = () => {
    if (!deleteTarget || !isDeleteConfirmed) return;
    deleteGoal(deleteTarget.id, {
      onSuccess: () => {
        refetch();
        handleCloseDeleteModal();
      },
    });
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "completed":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "in_progress":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "cancelled":
        return "bg-rose-50 text-rose-800 border-rose-300";
      default:
        return "bg-blue-50 text-blue-800 border-blue-300";
    }
  };

  return (
    <>
      <Topbar
        variant="light"
        title="Goals & OKRs"
        subtitle={`${activeWorkspaceName} Objectives & Key Results`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Banner matching Workspace & Project system */}
        <DashboardMetricsBanner cards={metricCards} />

        {/* Toolbar matching Workspace & Project system */}
        <div className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Workspace Selector & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[190px]">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Workspace
                </label>
                <div className="relative">
                  <select
                    value={selectedWorkspaceId}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
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

              {/* Search */}
              <div className="min-w-[220px] flex-1">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Search Goals
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search goal title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={COMMON_CLASSES.inputBase + " pl-8 text-xs"}
                  />
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5B6E68]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Filters & Action */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[140px]">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={COMMON_CLASSES.selectBase + " w-full"}
                >
                  <option value="all">All Statuses</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-end gap-2 pt-5">
                <button
                  onClick={handleOpenCreateModal}
                  className={COMMON_CLASSES.btnPrimary}
                >
                  <Plus size={15} />
                  Create Goal
                </button>
                <button
                  onClick={() => refetch()}
                  disabled={isRefetching}
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

        {/* Goals & OKRs Stream List */}
        <div className="border border-[#0F2D29]/15 bg-white p-6 shadow-2xs">
          <div className="mb-6 flex items-center justify-between border-b border-[#0F2D29]/10 pb-4">
            <h3
              className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}
            >
              <Target className="text-[#0F8A65]" size={18} />
              {activeWorkspaceName} Objectives & Key Results
            </h3>
            <span
              className={`${FONT_GOLDMAN} bg-[#0F2D29]/6 text-[#0F2D29] border border-[#0F2D29]/15 px-3 py-1 text-xs font-bold`}
            >
              {filteredGoals.length} Goals
            </span>
          </div>

          {isLoadingGoals ? (
            <div className="space-y-4 py-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-full animate-pulse border border-[#0F2D29]/10 bg-gray-50/60 p-4"
                />
              ))}
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Target size={36} className="text-[#8FA69E] mb-3" />
              <h4 className={`${COMMON_CLASSES.headingTitle} text-base`}>
                No workspace goals found
              </h4>
              <p className={`${COMMON_CLASSES.headingSubtitle} mt-1 max-w-md`}>
                No OKR objectives match your filter. Create a new goal to start
                tracking progress.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className={`${COMMON_CLASSES.btnPrimary} mt-5`}
              >
                <Plus size={15} />
                Create Workspace Goal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGoals.map((g: any) => {
                const targetStr = g.targetDate
                  ? new Date(g.targetDate).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "No Target Date";

                return (
                  <div
                    key={g._id || g.id}
                    className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs hover:border-[#0F8A65]/40 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`${FONT_GOLDMAN} text-sm font-bold text-[#0F2D29]`}
                          >
                            {g.title}
                          </h4>
                          <span
                            className={`${FONT_GOLDMAN} uppercase border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
                              g.status,
                            )}`}
                          >
                            {(g.status || "not_started").replace("_", " ")}
                          </span>
                        </div>
                        {g.description && (
                          <p
                            className={`${FONT_POPPINS} text-xs text-[#5B6E68] line-clamp-1`}
                          >
                            {g.description}
                          </p>
                        )}
                      </div>

                      {/* Target Date & Actions */}
                      <div className="flex items-center gap-4 text-xs text-[#5B6E68] shrink-0">
                        <div className="flex items-center gap-1.5 bg-gray-50 border border-[#0F2D29]/10 px-2.5 py-1">
                          <Calendar size={13} className="text-[#0F8A65]" />
                          <span className={FONT_POPPINS}>
                            Target: {targetStr}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditGoal(g)}
                            className="p-1.5 text-[#0F8A65] hover:bg-[#0F8A65]/10 border border-transparent hover:border-[#0F8A65]/20"
                            title="Edit Goal"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(g)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                            title="Delete Goal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Goal Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#5B6E68]">
                        <span>Goal Key Result Progress</span>
                        <span className={FONT_GOLDMAN}>{g.progress || 0}%</span>
                      </div>
                      <div className="h-3 w-full bg-gray-100 overflow-hidden border border-[#0F2D29]/12 relative">
                        <div
                          className="h-full bg-gradient-to-r from-[#0F2D29] to-[#0F8A65] transition-all duration-300"
                          style={{ width: `${g.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
          <div className={COMMON_CLASSES.modalShell}>
            <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
              <h3
                className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}
              >
                <Plus className="text-[#0F8A65]" size={18} />
                {editingGoalId
                  ? "Edit Workspace Goal"
                  : "Create Workspace Goal"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className={COMMON_CLASSES.labelUppercase}>
                  Goal Objective Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expand Enterprise Market Share by 25%"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Goal details and key result targets..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={COMMON_CLASSES.selectBase + " w-full"}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>
                    Progress (%): {progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>
                  Target Completion Date
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={COMMON_CLASSES.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className={COMMON_CLASSES.btnPrimary}
                >
                  {isCreating
                    ? "Creating..."
                    : isUpdating
                      ? "Updating..."
                      : editingGoalId
                        ? "Update Goal"
                        : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Text Confirm) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm border border-[#0F2D29]/15 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
              <h3
                className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2 text-rose-600`}
              >
                <AlertTriangle size={18} />
                Delete Goal
              </h3>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className={`${FONT_POPPINS} text-sm text-[#5B6E68]`}>
                This action cannot be undone. To confirm, type{" "}
                <span className="font-semibold text-[#0F2D29]">
                  {deleteTarget.title}
                </span>{" "}
                below.
              </p>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>
                  Goal Title
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder={deleteTarget.title}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isDeleteConfirmed) {
                      handleConfirmDelete();
                    }
                  }}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 p-4">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className={COMMON_CLASSES.btnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={!isDeleteConfirmed || isDeleting}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 text-xs font-semibold uppercase transition"
              >
                {isDeleting ? "Deleting..." : "Delete Goal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Goal;
