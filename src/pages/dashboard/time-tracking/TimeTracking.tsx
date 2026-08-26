import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useSyncedWorkspace } from "@/hooks/useSyncedWorkspace";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useGetProjectTasks } from "@/hooks/queries/task/use-get-project-tasks";
import { useGetWorkspaceTimeEntries } from "@/hooks/queries/time-entry/use-get-workspace-time-entries";
import { useCreateTimeEntry } from "@/hooks/mutations/time-entry/use-create-time-entry";
import { useDeleteTimeEntry } from "@/hooks/mutations/time-entry/use-delete-time-entry";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import {
  FONT_GOLDMAN,
  FONT_POPPINS,
  COMMON_CLASSES,
} from "@/components/common/design-system";
import { toast } from "sonner";

import {
  Clock,
  Building2,
  FolderGit2,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  X,
  Calendar,
  User,
  History,
  Timer,
  ListChecks,
  AlertTriangle,
} from "lucide-react";

export function TimeTracking() {
  const { openMobileNav } = useDashboardContext();

  const {
    workspaces,
    currentWorkspaceId: selectedWorkspaceId,
    setCurrentWorkspaceId: setSelectedWorkspaceId,
    isLoadingWorkspaces,
  } = useSyncedWorkspace();

  const { data: projectsResponse, isLoading: isLoadingProjects } =
    useGetWorkspaceProjects(selectedWorkspaceId);
  const projects = projectsResponse?.data || [];

  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  // 2. Fetch Time Entries
  const {
    data: timeEntriesResponse,
    isLoading: isLoadingTimeEntries,
    isRefetching,
    refetch,
  } = useGetWorkspaceTimeEntries(selectedWorkspaceId, {
    projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
  });

  const timeEntries = timeEntriesResponse?.data || [];

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTimeEntries = useMemo(() => {
    return timeEntries.filter((te: any) => {
      const matchesSearch =
        !searchQuery.trim() ||
        te.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        te.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        te.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [timeEntries, searchQuery]);

  // Metrics Calculations
  const activeWorkspaceName =
    workspaces.find((w: any) => (w._id || w.id) === selectedWorkspaceId)
      ?.name ?? "Workspace";

  const totalMinutes = useMemo(() => {
    return timeEntries.reduce(
      (sum: number, te: any) => sum + (te.durationMinutes || 0),
      0,
    );
  }, [timeEntries]);

  const totalHours = (totalMinutes / 60).toFixed(1);

  const activeContributors = useMemo(() => {
    const userIds = new Set(
      timeEntries.map((te: any) => te.user?._id || te.user?.id || te.user),
    );
    return userIds.size;
  }, [timeEntries]);

  const metricCards = [
    {
      title: "Total Hours Logged",
      value: `${totalHours} hrs`,
      subtitle: `${totalMinutes} total minutes logged`,
      icon: Clock,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "Time Entries",
      value: timeEntries.length,
      subtitle: "Logged task entries",
      icon: History,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Contributors",
      value: activeContributors,
      subtitle: "Team members logging time",
      icon: User,
      accentColor: "#6366F1",
      bgGradient: "from-[#6366F1]/10 to-transparent",
    },
    {
      title: "Avg Per Entry",
      value:
        timeEntries.length > 0
          ? `${Math.round(totalMinutes / timeEntries.length)} mins`
          : "0 mins",
      subtitle: "Average session duration",
      icon: Timer,
      accentColor: "#D97706",
      bgGradient: "from-[#D97706]/10 to-transparent",
    },
  ];

  // Mutations
  const { mutate: createEntry, isPending: isCreating } = useCreateTimeEntry();
  const { mutate: deleteEntry } = useDeleteTimeEntry();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string>("");
  const [targetTaskId, setTargetTaskId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [durationHours, setDurationHours] = useState<number>(1);
  const [durationMins, setDurationMins] = useState<number>(0);
  const [entryDate, setEntryDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const { data: tasksResponse, isLoading: isLoadingTasks } =
    useGetProjectTasks(targetProjectId);
  const tasks = (tasksResponse as any)?.data || [];


  React.useEffect(() => {
    setTargetTaskId("");
  }, [targetProjectId]);

  const resetForm = () => {
    setTargetProjectId("");
    setTargetTaskId("");
    setDescription("");
    setDurationHours(1);
    setDurationMins(0);
    setEntryDate(new Date().toISOString().split("T")[0]);
  };

  const handleOpenModal = () => {
    resetForm();
    if (projects.length > 0) {
      setTargetProjectId(projects[0]._id || projects[0].id || "");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId) return;

    if (!targetProjectId) {
      toast.error("Please select a project.");
      return;
    }

    if (!targetTaskId) {
      toast.error("Please select a task to log time against.");
      return;
    }

    const calculatedTotalMins =
      Number(durationHours) * 60 + Number(durationMins);
    if (calculatedTotalMins <= 0) {
      toast.error("Duration must be greater than 0.");
      return;
    }

    createEntry(
      {
        workspace: selectedWorkspaceId,
        project: targetProjectId,
        task: targetTaskId,
        description: description.trim(),
        durationMinutes: calculatedTotalMins,
        date: new Date(entryDate).toISOString(),
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
          refetch();
        },
      },
    );
  };

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const handleRequestDelete = (id: string) => {
    setDeletingEntryId(id);
    setDeleteConfirmInput("");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingEntryId) return;

    if (deleteConfirmInput.trim().toUpperCase() !== "DELETE") {
      toast.error('Please type "DELETE" to confirm.');
      return;
    }

    deleteEntry(deletingEntryId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setDeletingEntryId(null);
        setDeleteConfirmInput("");
        refetch();
        toast.success("Time entry deleted successfully.");
      },
    });
  };

  return (
    <>
      <Topbar
        variant="light"
        title="Time Tracking & Timesheets"
        subtitle={`${activeWorkspaceName} · Team Time Log Stream`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <DashboardMetricsBanner cards={metricCards} />
        <div className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Workspace & Project Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-47.5">
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

              <div className="min-w-47.5">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Project Filter
                </label>
                <div className="relative">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    disabled={isLoadingProjects}
                    className={COMMON_CLASSES.selectBase + " w-full pl-8"}
                  >
                    <option value="all">All Projects</option>
                    {projects.map((p: any) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <FolderGit2
                    size={15}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5B6E68]"
                  />
                </div>
              </div>

              {/* Search */}
              <div className="min-w-55 flex-1">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Search Log
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search work description..."
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

            {/* Right: Actions */}
            <div className="flex items-end gap-2 pt-5">
              <button
                onClick={handleOpenModal}
                className={COMMON_CLASSES.btnPrimary}
              >
                <Plus size={15} />
                Log Time Entry
              </button>
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className={COMMON_CLASSES.btnSecondary + " px-2.5"}
              >
                <RefreshCw
                  size={14}
                  className={isRefetching ? "animate-spin text-[#0F8A65]" : ""}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Time Entry Stream List */}
        <div className="border border-[#0F2D29]/15 bg-white p-6 shadow-2xs">
          <div className="mb-6 flex items-center justify-between border-b border-[#0F2D29]/10 pb-4">
            <h3
              className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}
            >
              <Clock className="text-[#0F8A65]" size={18} />
              {activeWorkspaceName} Timesheets & Log Stream
            </h3>
            <span
              className={`${FONT_GOLDMAN} bg-[#0F2D29]/6 text-[#0F2D29] border border-[#0F2D29]/15 px-3 py-1 text-xs font-bold`}
            >
              {filteredTimeEntries.length} Entries
            </span>
          </div>

          {isLoadingTimeEntries ? (
            <div className="space-y-4 py-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-full animate-pulse border border-[#0F2D29]/10 bg-gray-50/60 p-4"
                />
              ))}
            </div>
          ) : filteredTimeEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock size={36} className="text-[#8FA69E] mb-3" />
              <h4 className={`${COMMON_CLASSES.headingTitle} text-base`}>
                No time entries logged
              </h4>
              <p className={`${COMMON_CLASSES.headingSubtitle} mt-1 max-w-md`}>
                No work sessions logged for this workspace/project. Click Log
                Time Entry to add your hours.
              </p>
              <button
                onClick={handleOpenModal}
                className={`${COMMON_CLASSES.btnPrimary} mt-5`}
              >
                <Plus size={15} />
                Log First Time Entry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTimeEntries.map((te: any) => {
                const dateStr = new Date(
                  te.date || te.createdAt,
                ).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const hrs = Math.floor((te.durationMinutes || 0) / 60);
                const mins = (te.durationMinutes || 0) % 60;
                const durationLabel = `${hrs > 0 ? `${hrs}h ` : ""}${mins}m`;

                return (
                  <div
                    key={te._id || te.id}
                    className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs hover:border-[#0F8A65]/40 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`${FONT_GOLDMAN} bg-[#0F2D29] text-white px-2.5 py-0.5 text-xs font-bold`}
                        >
                          {durationLabel}
                        </span>
                        {te.project?.name && (
                          <span
                            className={`${FONT_GOLDMAN} bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold`}
                          >
                            {te.project.name}
                          </span>
                        )}
                        {te.task?.title && (
                          <span
                            className={`${FONT_GOLDMAN} bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold`}
                          >
                            {te.task.title}
                          </span>
                        )}
                        <span
                          className={`${FONT_POPPINS} text-xs font-semibold text-[#5B6E68] flex items-center gap-1`}
                        >
                          <User size={12} className="text-[#8FA69E]" />
                          {te.user?.name || "Team Member"}
                        </span>
                      </div>

                      {te.description && (
                        <p
                          className={`${FONT_POPPINS} text-xs text-[#0F2D29] font-medium`}
                        >
                          {te.description}
                        </p>
                      )}
                    </div>

                    {/* Date & Actions */}
                    <div className="flex items-center gap-4 text-xs text-[#5B6E68] shrink-0">
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-[#0F2D29]/10 px-2.5 py-1">
                        <Calendar size={13} className="text-[#0F8A65]" />
                        <span className={FONT_POPPINS}>{dateStr}</span>
                      </div>

                      <button
                        onClick={() => handleRequestDelete(te._id || te.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                        title="Delete Entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Log Time Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
          <div className={COMMON_CLASSES.modalShell}>
            <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
              <h3
                className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}
              >
                <Clock className="text-[#0F8A65]" size={18} />
                Log Work Session Time
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
                  Project *
                </label>
                <select
                  required
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className={COMMON_CLASSES.selectBase + " w-full"}
                >
                  <option value="">Select a project</option>
                  {projects.map((p: any) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>Task *</label>
                <div className="relative">
                  <select
                    required
                    value={targetTaskId}
                    onChange={(e) => setTargetTaskId(e.target.value)}
                    disabled={!targetProjectId || isLoadingTasks}
                    className={COMMON_CLASSES.selectBase + " w-full pl-8"}
                  >
                    <option value="">
                      {!targetProjectId
                        ? "Select a project first"
                        : isLoadingTasks
                          ? "Loading tasks..."
                          : tasks.length === 0
                            ? "No tasks available"
                            : "Select a task"}
                    </option>
                    {tasks.map((t: any) => (
                      <option key={t._id || t.id} value={t._id || t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                  <ListChecks
                    size={15}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5B6E68]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>
                    Duration Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className={COMMON_CLASSES.inputBase}
                  />
                </div>

                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>
                    Duration Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className={COMMON_CLASSES.inputBase}
                  />
                </div>
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>
                  Work Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="What work was performed during this time session..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>Date</label>
                <input
                  type="date"
                  required
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
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
                  disabled={isCreating || !targetTaskId}
                  className={COMMON_CLASSES.btnPrimary}
                >
                  {isCreating ? "Saving..." : "Log Time Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
          <div className={`${COMMON_CLASSES.modalShell} max-w-md w-full`}>
            <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
              <h3
                className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2 text-rose-600`}
              >
                <AlertTriangle size={18} />
                Confirm Deletion
              </h3>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingEntryId(null);
                  setDeleteConfirmInput("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmDelete} className="p-4 space-y-4">
              <p className={`${FONT_POPPINS} text-xs text-[#5B6E68]`}>
                This action cannot be undone. To permanently delete this time log
                entry, please type <span className="font-bold text-rose-600">DELETE</span> in the box below.
              </p>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>
                  Verification Text *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder='Type "DELETE" to confirm'
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  className={`${COMMON_CLASSES.inputBase} border-rose-300 focus:border-rose-600 focus:ring-rose-500`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingEntryId(null);
                    setDeleteConfirmInput("");
                  }}
                  className={COMMON_CLASSES.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmInput.trim().toUpperCase() !== "DELETE"}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Confirm & Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default TimeTracking;
