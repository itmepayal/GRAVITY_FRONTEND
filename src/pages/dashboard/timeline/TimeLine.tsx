import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useGetProjectMilestones } from "@/hooks/queries/timeline/use-get-project-milestones";
import { useCreateMilestone } from "@/hooks/mutations/timeline/use-create-milestone";
import { useUpdateMilestone } from "@/hooks/mutations/timeline/use-update-milestone";
import { useDeleteMilestone } from "@/hooks/mutations/timeline/use-delete-milestone";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import {
    FONT_GOLDMAN,
    FONT_POPPINS,
    COMMON_CLASSES,
} from "@/components/common/design-system";
import type { MilestoneStatus } from "@/apis/timeline.api";
import { toast } from "sonner";

import {
    GanttChartSquare,
    Building2,
    FolderGit2,
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
} from "lucide-react";

export function TimeLine() {
    const { openMobileNav } = useDashboardContext();

    // 1. Fetch Workspaces & Projects
    const { data: workspacesResponse, isLoading: isLoadingWorkspaces } =
        useGetUserWorkspaces();
    const workspaces = workspacesResponse?.data || [];

    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

    React.useEffect(() => {
        if (workspaces.length > 0 && !selectedWorkspaceId) {
            setSelectedWorkspaceId(workspaces[0]._id || workspaces[0].id);
        }
    }, [workspaces, selectedWorkspaceId]);

    const { data: projectsResponse, isLoading: isLoadingProjects } =
        useGetWorkspaceProjects(selectedWorkspaceId);
    const projects = projectsResponse?.data || [];

    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    React.useEffect(() => {
        if (projects.length > 0) {
            const currentValid = projects.some(
                (p: any) => (p._id || p.id) === selectedProjectId,
            );
            if (!selectedProjectId || !currentValid) {
                setSelectedProjectId(projects[0]._id || projects[0].id);
            }
        } else {
            setSelectedProjectId("");
        }
    }, [projects, selectedProjectId]);

    // 2. Fetch Milestones for Selected Project
    const {
        data: milestonesResponse,
        isLoading: isLoadingMilestones,
        isRefetching,
        refetch,
    } = useGetProjectMilestones(selectedProjectId);

    const milestones = milestonesResponse?.data || [];

    // Filter & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filteredMilestones = useMemo(() => {
        return milestones.filter((m: any) => {
            const matchesSearch =
                !searchQuery.trim() ||
                m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus =
                statusFilter === "all" || m.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [milestones, searchQuery, statusFilter]);

    // Metrics Calculations
    const activeWorkspaceName =
        workspaces.find((w: any) => (w._id || w.id) === selectedWorkspaceId)
            ?.name ?? "Workspace";

    const activeProjectName =
        projects.find((p: any) => (p._id || p.id) === selectedProjectId)?.name ??
        "Project";

    const completedCount = useMemo(
        () => milestones.filter((m: any) => m.status === "completed").length,
        [milestones],
    );

    const inProgressCount = useMemo(
        () => milestones.filter((m: any) => m.status === "in_progress").length,
        [milestones],
    );

    const avgProgress = useMemo(() => {
        if (milestones.length === 0) return 0;
        const total = milestones.reduce(
            (sum: number, m: any) => sum + (m.progress || 0),
            0,
        );
        return Math.round(total / milestones.length);
    }, [milestones]);

    const metricCards = [
        {
            title: "Total Milestones",
            value: milestones.length,
            subtitle: `${activeProjectName} roadmap schedule`,
            icon: GanttChartSquare,
            accentColor: "#0F2D29",
            bgGradient: "from-[#0F2D29]/5 to-transparent",
        },
        {
            title: "In Progress",
            value: inProgressCount,
            subtitle: "Active roadmap phases",
            icon: Clock,
            accentColor: "#D97706",
            bgGradient: "from-[#D97706]/10 to-transparent",
        },
        {
            title: "Completed",
            value: completedCount,
            subtitle: "Achieved milestones",
            icon: CheckCircle2,
            accentColor: "#0F8A65",
            bgGradient: "from-[#0F8A65]/10 to-transparent",
        },
        {
            title: "Avg Progress",
            value: `${avgProgress}%`,
            subtitle: "Overall schedule completion",
            icon: TrendingUp,
            accentColor: "#6366F1",
            bgGradient: "from-[#6366F1]/10 to-transparent",
        },
    ];

    // Mutations
    const { mutate: createMilestone, isPending: isCreating } = useCreateMilestone();
    const { mutate: updateMilestone, isPending: isUpdating } = useUpdateMilestone();
    const { mutate: deleteMilestone } = useDeleteMilestone();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
        null,
    );
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<MilestoneStatus>("upcoming");
    const [progress, setProgress] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>(
        new Date().toISOString().split("T")[0],
    );
    const [dueDate, setDueDate] = useState<string>(
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    );

    const resetForm = () => {
        setEditingMilestoneId(null);
        setTitle("");
        setDescription("");
        setStatus("upcoming");
        setProgress(0);
        setStartDate(new Date().toISOString().split("T")[0]);
        setDueDate(
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
        );
    };

    const handleOpenCreateModal = () => {
        if (!selectedProjectId) {
            toast.error("Please select a target project first.");
            return;
        }
        resetForm();
        setIsModalOpen(true);
    };

    const handleEditMilestone = (m: any) => {
        setEditingMilestoneId(m._id || m.id);
        setTitle(m.title || "");
        setDescription(m.description || "");
        setStatus(m.status || "upcoming");
        setProgress(m.progress || 0);
        if (m.startDate) setStartDate(new Date(m.startDate).toISOString().split("T")[0]);
        if (m.dueDate) setDueDate(new Date(m.dueDate).toISOString().split("T")[0]);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !selectedWorkspaceId || !selectedProjectId) return;

        if (editingMilestoneId) {
            updateMilestone(
                {
                    milestoneId: editingMilestoneId,
                    data: {
                        title: title.trim(),
                        description: description.trim(),
                        status,
                        progress: Number(progress),
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
            createMilestone(
                {
                    title: title.trim(),
                    description: description.trim(),
                    workspace: selectedWorkspaceId,
                    project: selectedProjectId,
                    status,
                    startDate: new Date(startDate).toISOString(),
                    dueDate: new Date(dueDate).toISOString(),
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

    const handleDelete = (id: string) => {
        deleteMilestone(id, { onSuccess: () => refetch() });
    };

    const getStatusBadge = (s: string) => {
        switch (s) {
            case "completed":
                return "bg-emerald-50 text-emerald-800 border-emerald-300";
            case "in_progress":
                return "bg-amber-50 text-amber-800 border-amber-300";
            case "missed":
                return "bg-rose-50 text-rose-800 border-rose-300";
            default:
                return "bg-indigo-50 text-indigo-800 border-indigo-300";
        }
    };

    return (
        <>
            <Topbar
                variant="light"
                title="Timeline & Gantt Schedule"
                subtitle={`${activeWorkspaceName} · ${activeProjectName}`}
                onMenuClick={openMobileNav}
            />

            <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Banner matching Workspace & Project system */}
                <DashboardMetricsBanner cards={metricCards} />

                {/* Toolbar matching Workspace & Project system */}
                <div className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Left: Workspace & Project Selectors */}
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
                                            setSelectedProjectId("");
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

                            <div className="min-w-[190px]">
                                <label className={COMMON_CLASSES.labelUppercase}>
                                    Target Project
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        disabled={isLoadingProjects || projects.length === 0}
                                        className={COMMON_CLASSES.selectBase + " w-full pl-8"}
                                    >
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
                            <div className="min-w-[220px] flex-1">
                                <label className={COMMON_CLASSES.labelUppercase}>
                                    Search Schedule
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search milestone..."
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
                                    <option value="upcoming">Upcoming</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="missed">Missed</option>
                                </select>
                            </div>

                            <div className="flex items-end gap-2 pt-5">
                                <button
                                    onClick={handleOpenCreateModal}
                                    className={COMMON_CLASSES.btnPrimary}
                                >
                                    <Plus size={15} />
                                    Add Milestone
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
                </div>

                {/* Interactive Gantt Timeline Roadmap View */}
                <div className="border border-[#0F2D29]/15 bg-white p-6 shadow-2xs">
                    <div className="mb-6 flex items-center justify-between border-b border-[#0F2D29]/10 pb-4">
                        <h3
                            className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}
                        >
                            <GanttChartSquare className="text-[#0F8A65]" size={18} />
                            {activeProjectName} Timeline & Gantt Schedule
                        </h3>
                        <span
                            className={`${FONT_GOLDMAN} bg-[#0F2D29]/6 text-[#0F2D29] border border-[#0F2D29]/15 px-3 py-1 text-xs font-bold`}
                        >
                            {filteredMilestones.length} Milestones
                        </span>
                    </div>

                    {isLoadingMilestones ? (
                        <div className="space-y-4 py-8">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-20 w-full animate-pulse border border-[#0F2D29]/10 bg-gray-50/60 p-4"
                                />
                            ))}
                        </div>
                    ) : filteredMilestones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <GanttChartSquare size={36} className="text-[#8FA69E] mb-3" />
                            <h4 className={`${COMMON_CLASSES.headingTitle} text-base`}>
                                No timeline milestones scheduled
                            </h4>
                            <p className={`${COMMON_CLASSES.headingSubtitle} mt-1 max-w-md`}>
                                No milestones match your criteria for this project. Add your first milestone to create the roadmap.
                            </p>
                            <button
                                onClick={handleOpenCreateModal}
                                className={`${COMMON_CLASSES.btnPrimary} mt-5`}
                            >
                                <Plus size={15} />
                                Create Milestone
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredMilestones.map((m: any) => {
                                const startStr = new Date(m.startDate).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                });
                                const dueStr = new Date(m.dueDate).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                });

                                return (
                                    <div
                                        key={m._id || m.id}
                                        className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs hover:border-[#0F8A65]/40 transition space-y-3"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="space-y-1 min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className={`${FONT_GOLDMAN} text-sm font-bold text-[#0F2D29]`}>
                                                        {m.title}
                                                    </h4>
                                                    <span
                                                        className={`${FONT_GOLDMAN} uppercase border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
                                                            m.status,
                                                        )}`}
                                                    >
                                                        {m.status.replace("_", " ")}
                                                    </span>
                                                </div>
                                                {m.description && (
                                                    <p className={`${FONT_POPPINS} text-xs text-[#5B6E68] line-clamp-1`}>
                                                        {m.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Date Range & Actions */}
                                            <div className="flex items-center gap-4 text-xs text-[#5B6E68] shrink-0">
                                                <div className="flex items-center gap-1.5 bg-gray-50 border border-[#0F2D29]/10 px-2.5 py-1">
                                                    <Calendar size={13} className="text-[#0F8A65]" />
                                                    <span className={FONT_POPPINS}>
                                                        {startStr} → {dueStr}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleEditMilestone(m)}
                                                        className="p-1.5 text-[#0F8A65] hover:bg-[#0F8A65]/10 border border-transparent hover:border-[#0F8A65]/20"
                                                        title="Edit Milestone"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(m._id || m.id)}
                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                                                        title="Delete Milestone"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar & Gantt Visual Bar */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[11px] font-semibold text-[#5B6E68]">
                                                <span>Completion Progress</span>
                                                <span className={FONT_GOLDMAN}>{m.progress}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-100 overflow-hidden border border-[#0F2D29]/12 relative">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#0F2D29] to-[#0F8A65] transition-all duration-300"
                                                    style={{ width: `${m.progress}%` }}
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

            {/* Create / Edit Milestone Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
                    <div className={COMMON_CLASSES.modalShell}>
                        <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
                            <h3
                                className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}
                            >
                                <Plus className="text-[#0F8A65]" size={18} />
                                {editingMilestoneId ? "Edit Milestone" : "Add Milestone"}
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
                                    Milestone Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Beta Version Release"
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
                                    placeholder="Milestone details..."
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
                                        onChange={(e) =>
                                            setStatus(e.target.value as MilestoneStatus)
                                        }
                                        className={COMMON_CLASSES.selectBase + " w-full"}
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="missed">Missed</option>
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

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={COMMON_CLASSES.labelUppercase}>
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className={COMMON_CLASSES.inputBase}
                                    />
                                </div>

                                <div>
                                    <label className={COMMON_CLASSES.labelUppercase}>
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className={COMMON_CLASSES.inputBase}
                                    />
                                </div>
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
                                        ? "Saving..."
                                        : isUpdating
                                            ? "Updating..."
                                            : editingMilestoneId
                                                ? "Update Milestone"
                                                : "Add Milestone"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default TimeLine;
