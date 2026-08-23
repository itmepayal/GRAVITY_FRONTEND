import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useGetAnalyticsOverview } from "@/hooks/queries/analytics/use-get-analytics-overview";
import { useGetAnalyticsSnapshots } from "@/hooks/queries/analytics/use-get-analytics-snapshots";
import { useCreateAnalyticsSnapshot } from "@/hooks/mutations/analytics/use-create-analytics-snapshot";
import { useDeleteAnalyticsSnapshot } from "@/hooks/mutations/analytics/use-delete-analytics-snapshot";
import type { AnalyticsPeriod, IAnalyticsSnapshot } from "@/types/analytics";
import {
    BarChart3,
    Clock,
    Flame,
    AlertTriangle,
    RefreshCw,
    Camera,
    Layers,
    Calendar,
    CheckCircle2,
    Users,
    Zap,
    UserCheck,
    Building2,
    Sparkles,
    Loader2,
    Trash2,
    Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export const Analytics: React.FC = () => {
    const { openMobileNav } = useDashboardContext();
    const currentWorkspaceIdFromStore = useWorkspaceStore((s) => s.currentWorkspaceId);

    const { data: workspacesData, isLoading: isLoadingWorkspaces } = useGetUserWorkspaces();
    const workspaces = useMemo(() => {
        const raw = Array.isArray(workspacesData) ? workspacesData : (workspacesData?.data ?? []);
        return raw.map((w: any) => ({
            id: w._id ?? w.id,
            name: w.name ?? "Workspace",
        }));
    }, [workspacesData]);

    const activeWorkspaceId = currentWorkspaceIdFromStore || workspaces[0]?.id || "";

    const [selectedWorkspace, setSelectedWorkspace] = useState<string>(activeWorkspaceId);
    const [selectedProject, setSelectedProject] = useState<string>("all");
    const [period, setPeriod] = useState<AnalyticsPeriod>("weekly");
    const [activeTab, setActiveTab] = useState<"overview" | "snapshots">("overview");

    React.useEffect(() => {
        if (activeWorkspaceId && !selectedWorkspace) {
            setSelectedWorkspace(activeWorkspaceId);
        }
    }, [activeWorkspaceId, selectedWorkspace]);

    const { data: projectsData } = useGetWorkspaceProjects(selectedWorkspace || activeWorkspaceId);
    const projects = useMemo(() => {
        const raw = Array.isArray(projectsData) ? projectsData : (projectsData?.data ?? []);
        return raw.map((p: any) => ({
            id: p._id ?? p.id,
            name: p.name ?? "Untitled Project",
        }));
    }, [projectsData]);

    const {
        data: analyticsData,
        isLoading: isLoadingAnalytics,
        isRefetching,
        refetch,
    } = useGetAnalyticsOverview({
        workspaceId: selectedWorkspace || activeWorkspaceId,
        projectId: selectedProject !== "all" ? selectedProject : undefined,
        period,
    });

    const { data: snapshotsData, isLoading: isLoadingSnapshots } = useGetAnalyticsSnapshots({
        workspaceId: selectedWorkspace || activeWorkspaceId,
        projectId: selectedProject !== "all" ? selectedProject : undefined,
    });

    const { mutate: createSnapshot, isPending: isSavingSnapshot } = useCreateAnalyticsSnapshot();
    const { mutate: deleteSnapshot, isPending: isDeletingSnapshot } = useDeleteAnalyticsSnapshot();

    const [selectedSnapshot, setSelectedSnapshot] = useState<IAnalyticsSnapshot | null>(null);

    const handleDeleteSnapshot = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        deleteSnapshot(id, {
            onSuccess: () => {
                toast.success("Snapshot deleted successfully.");
                setSelectedSnapshot((current) => (current?._id === id ? null : current));
            },
            onError: (err: any) => {
                toast.error(err?.message || "Failed to delete snapshot.");
            },
        });
    };

    const handleTakeSnapshot = () => {
        const targetWs = selectedWorkspace || activeWorkspaceId;
        if (!targetWs) {
            toast.error("Please select a workspace first.");
            return;
        }
        createSnapshot(
            {
                workspace: targetWs,
                project: selectedProject !== "all" ? selectedProject : null,
                period,
            },
            {
                onSuccess: () => {
                    toast.success("Analytics snapshot captured and saved successfully!");
                },
                onError: (err: any) => {
                    toast.error(err?.message || "Failed to create snapshot.");
                },
            }
        );
    };

    const overview = analyticsData?.data;
    const metrics = overview?.metrics;
    const snapshots = snapshotsData?.data || [];

    const bannerCards = [
        {
            title: "Tasks Completed",
            value: metrics ? `${metrics.tasks.completed}/${metrics.tasks.total}` : 0,
            subtitle: metrics ? `${metrics.tasks.storyPointsCompleted} story points` : "Story points delivered",
            icon: CheckCircle2,
            accentColor: "#0F8A65",
            bgGradient: "from-[#0F8A65]/10 to-transparent",
        },
        {
            title: "Logged Hours",
            value: metrics ? `${metrics.timeTracking.totalHoursLogged} hrs` : "0 hrs",
            subtitle: metrics ? `${metrics.timeTracking.entriesCount} time entries` : "Time entries logged",
            icon: Clock,
            accentColor: "#2563EB",
            bgGradient: "from-[#2563EB]/10 to-transparent",
        },
        {
            title: "Sprint Velocity",
            value: metrics ? `${metrics.sprints.velocity} pts` : "0 pts",
            subtitle: metrics ? `${metrics.sprints.activeCount} active sprints` : "Active sprint velocity",
            icon: Flame,
            accentColor: "#7C3AED",
            bgGradient: "from-[#7C3AED]/10 to-transparent",
        },
        {
            title: "Overdue Tasks",
            value: metrics ? metrics.tasks.overdue : 0,
            subtitle: "Pending tasks past due date",
            icon: AlertTriangle,
            accentColor: "#DC2626",
            bgGradient: "from-[#DC2626]/10 to-transparent",
        },
    ];

    return (
        <>
            <Topbar
                variant="light"
                title="Analytics & Performance"
                subtitle="Real-time throughput, velocity metrics, status distribution, and saved snapshots"
                onMenuClick={openMobileNav}
            />

            <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Metric Banner matched with Workspaces/Projects design */}
                <DashboardMetricsBanner cards={bannerCards} />

                {/* Filter Controls Bar matching Workspaces design system */}
                <div className="flex flex-col gap-4 rounded-2xl border border-[#0F2D29]/12 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Workspace dropdown */}
                        <div className="flex items-center gap-2 rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-1.5 shadow-2xs">
                            <Building2 size={15} className="text-[#0F8A65]" />
                            <select
                                value={selectedWorkspace || activeWorkspaceId}
                                onChange={(e) => setSelectedWorkspace(e.target.value)}
                                disabled={isLoadingWorkspaces}
                                className="bg-transparent text-[13px] font-semibold text-[#0F2D29] outline-none cursor-pointer"
                            >
                                {workspaces.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Project dropdown */}
                        <div className="flex items-center gap-2 rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-1.5 shadow-2xs">
                            <Layers size={15} className="text-[#2563EB]" />
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="bg-transparent text-[13px] font-semibold text-[#0F2D29] outline-none cursor-pointer"
                            >
                                <option value="all">All Projects</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Horizon Period dropdown */}
                        <div className="flex items-center gap-2 rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-1.5 shadow-2xs">
                            <Calendar size={15} className="text-[#7C3AED]" />
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}
                                className="bg-transparent text-[13px] font-semibold text-[#0F2D29] outline-none cursor-pointer"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isRefetching || isLoadingAnalytics}
                            className="flex items-center gap-1.5 rounded-xl border border-[#0F2D29]/15 bg-white px-3.5 py-2 text-[12.5px] font-bold text-[#0F2D29] transition-colors hover:bg-[#0F2D29]/5 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />
                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={handleTakeSnapshot}
                            disabled={isSavingSnapshot || !metrics}
                            className="flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#0F2D29]/90 disabled:opacity-50"
                        >
                            <Camera size={15} />
                            {isSavingSnapshot ? "Saving..." : "Take Snapshot"}
                        </button>
                    </div>
                </div>

                {/* View Segment Tabs */}
                <div className="flex border-b border-[#0F2D29]/10 gap-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`pb-3 text-sm font-bold transition-all relative ${activeTab === "overview"
                            ? "text-[#0F2D29] border-b-2 border-[#0F8A65]"
                            : "text-[#0F2D29]/50 hover:text-[#0F2D29]"
                            }`}
                    >
                        Live Performance Dashboard
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("snapshots")}
                        className={`pb-3 text-sm font-bold transition-all relative ${activeTab === "snapshots"
                            ? "text-[#0F2D29] border-b-2 border-[#0F8A65]"
                            : "text-[#0F2D29]/50 hover:text-[#0F2D29]"
                            }`}
                    >
                        Historical Snapshots ({snapshots.length})
                    </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === "overview" && (
                    <>
                        {isLoadingAnalytics ? (
                            <div className="flex min-h-80 items-center justify-center border border-dashed border-[#0F2D29]/15 bg-white rounded-2xl">
                                <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
                            </div>
                        ) : !metrics ? (
                            <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-[#0F2D29]/15 bg-white p-8 rounded-2xl text-center">
                                <Sparkles size={24} className="text-[#0F8A65] mb-2" />
                                <p className="text-sm font-bold text-[#0F2D29]">No Analytics Found</p>
                                <p className="text-xs text-[#5B6E68] mt-1">
                                    Try switching workspace or project filters to view metrics.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {/* Panel 1: Status Breakdown */}
                                <div className="rounded-2xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs">
                                    <div className="flex items-center justify-between pb-4 border-b border-[#0F2D29]/10">
                                        <div>
                                            <h4 className="text-sm font-black text-[#0F2D29] uppercase tracking-wide flex items-center gap-2">
                                                <BarChart3 size={16} className="text-[#0F8A65]" /> Status Distribution
                                            </h4>
                                            <p className="text-[11.5px] font-medium text-[#5B6E68] mt-0.5">
                                                Task count per workflow column
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        {Object.keys(metrics.breakdownByStatus).length === 0 ? (
                                            <p className="text-xs text-[#5B6E68]">No tasks registered yet.</p>
                                        ) : (
                                            Object.entries(metrics.breakdownByStatus).map(([status, count]) => {
                                                const pct =
                                                    metrics.tasks.total > 0
                                                        ? Math.round((count / metrics.tasks.total) * 100)
                                                        : 0;
                                                return (
                                                    <div key={status} className="space-y-1.5">
                                                        <div className="flex justify-between text-xs font-bold text-[#0F2D29]">
                                                            <span className="capitalize">{status.replace("_", " ")}</span>
                                                            <span className="text-[#5B6E68]">
                                                                {count} ({pct}%)
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full rounded-full bg-[#0F2D29]/5 overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-[#0F8A65] transition-all duration-300"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Panel 2: Priority Breakdown */}
                                <div className="rounded-2xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs">
                                    <div className="flex items-center justify-between pb-4 border-b border-[#0F2D29]/10">
                                        <div>
                                            <h4 className="text-sm font-black text-[#0F2D29] uppercase tracking-wide flex items-center gap-2">
                                                <Zap size={16} className="text-[#D97706]" /> Priority Breakdown
                                            </h4>
                                            <p className="text-[11.5px] font-medium text-[#5B6E68] mt-0.5">
                                                Task proportion by priority
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        {Object.keys(metrics.breakdownByPriority).length === 0 ? (
                                            <p className="text-xs text-[#5B6E68]">No priority data available.</p>
                                        ) : (
                                            Object.entries(metrics.breakdownByPriority).map(([priority, count]) => {
                                                const pct =
                                                    metrics.tasks.total > 0
                                                        ? Math.round((count / metrics.tasks.total) * 100)
                                                        : 0;
                                                return (
                                                    <div key={priority} className="space-y-1.5">
                                                        <div className="flex justify-between items-center text-xs font-bold text-[#0F2D29]">
                                                            <span className="capitalize px-2 py-0.5 rounded-md bg-[#0F2D29]/5 text-[11px]">
                                                                {priority}
                                                            </span>
                                                            <span className="text-[#5B6E68]">{count} tasks</span>
                                                        </div>
                                                        <div className="h-2 w-full rounded-full bg-[#0F2D29]/5 overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-[#D97706] transition-all duration-300"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Panel 3: Top Contributors Leaderboard */}
                                <div className="rounded-2xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs">
                                    <div className="flex items-center justify-between pb-4 border-b border-[#0F2D29]/10">
                                        <div>
                                            <h4 className="text-sm font-black text-[#0F2D29] uppercase tracking-wide flex items-center gap-2">
                                                <Users size={16} className="text-[#2563EB]" /> Top Performers
                                            </h4>
                                            <p className="text-[11.5px] font-medium text-[#5B6E68] mt-0.5">
                                                Completed tasks & time tracked
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-[#0F2D29]/5 px-2.5 py-1 text-[11px] font-bold text-[#0F2D29]">
                                            {metrics.team.activeMembersCount} Members
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        {metrics.team.topContributors.length === 0 ? (
                                            <p className="text-xs text-[#5B6E68]">No recorded team task activity.</p>
                                        ) : (
                                            metrics.team.topContributors.map((c, idx) => {
                                                const userObj = typeof c.user === "object" ? c.user : null;
                                                const name = userObj?.name || `Teammate ${idx + 1}`;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between rounded-xl border border-[#0F2D29]/8 bg-[#0F2D29]/2 p-3 transition-colors hover:bg-[#0F2D29]/5"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2D29] text-xs font-bold text-white">
                                                                {name.slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-[#0F2D29]">{name}</p>
                                                                <p className="text-[10.5px] font-medium text-[#5B6E68]">
                                                                    {c.minutesLogged} mins logged
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-extrabold text-[#0F8A65]">
                                                                {c.tasksCompleted}
                                                            </span>
                                                            <span className="block text-[10px] font-bold text-[#5B6E68]">done</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* TAB 2: HISTORICAL SNAPSHOTS */}
                {activeTab === "snapshots" && (
                    <div className="rounded-2xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0F2D29]/10 gap-3">
                            <div>
                                <h4 className="text-base font-black text-[#0F2D29]">Historical Analytics Snapshots</h4>
                                <p className="text-xs text-[#5B6E68] mt-0.5">
                                    Archived performance snapshots captured for auditing and management reporting.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleTakeSnapshot}
                                disabled={isSavingSnapshot}
                                className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-[#0F2D29] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0F2D29]/90 disabled:opacity-50"
                            >
                                <Camera size={14} />
                                Capture Now
                            </button>
                        </div>

                        <div className="mt-5">
                            {isLoadingSnapshots ? (
                                <div className="flex min-h-48 items-center justify-center">
                                    <Loader2 size={22} className="animate-spin text-[#0F8A65]" />
                                </div>
                            ) : snapshots.length === 0 ? (
                                <div className="py-12 text-center text-xs font-medium text-[#5B6E68]">
                                    No snapshots captured yet. Click "Capture Now" to record a snapshot of current metrics.
                                </div>
                            ) : (
                                <div className="divide-y divide-[#0F2D29]/8">
                                    {snapshots.map((snap) => {
                                        const createdUser = typeof snap.createdBy === "object" ? snap.createdBy : null;
                                        return (
                                            <div
                                                key={snap._id}
                                                onClick={() => setSelectedSnapshot(snap)}
                                                className="group flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3 hover:bg-[#0F8A65]/5 px-4 rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#0F8A65]/20"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded-md bg-[#0F8A65]/10 px-2 py-0.5 text-[10.5px] font-bold text-[#0F8A65] uppercase">
                                                            {snap.period}
                                                        </span>
                                                        <span className="text-xs font-bold text-[#0F2D29]">
                                                            {new Date(snap.snapshotDate).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#5B6E68]">
                                                        Completed Tasks: {snap.metrics.tasks.completed}/{snap.metrics.tasks.total} · Logged: {snap.metrics.timeTracking.totalHoursLogged} hrs · Sprint Velocity: {snap.metrics.sprints.velocity} pts
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                                    {createdUser && (
                                                        <div className="flex items-center gap-1.5 text-xs text-[#5B6E68]">
                                                            <UserCheck size={14} className="text-[#0F8A65]" />
                                                            <span>Saved by {createdUser.name}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedSnapshot(snap);
                                                            }}
                                                            className="flex items-center gap-1 rounded-lg bg-[#0F2D29] px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-[#0F2D29]/80"
                                                        >
                                                            <Eye size={12} />
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDeleteSnapshot(snap._id, e)}
                                                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                                                            title="Delete snapshot"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SNAPSHOT DETAIL MODAL */}
                <Dialog open={!!selectedSnapshot} onOpenChange={(open) => !open && setSelectedSnapshot(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-2xl border border-[#0F2D29]/15">
                        {selectedSnapshot && (
                            <div className="space-y-6">
                                <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-[#0F2D29]/10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="rounded-md bg-[#0F8A65]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#0F8A65] uppercase">
                                                {selectedSnapshot.period} Snapshot
                                            </span>
                                            <span className="text-xs font-semibold text-[#5B6E68]">
                                                {new Date(selectedSnapshot.snapshotDate).toLocaleString()}
                                            </span>
                                        </div>
                                        <DialogTitle className="text-lg font-black text-[#0F2D29]">
                                            Analytics Snapshot Overview
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-[#5B6E68] mt-0.5">
                                            {typeof selectedSnapshot.createdBy === "object" && selectedSnapshot.createdBy?.name
                                                ? `Captured by ${selectedSnapshot.createdBy.name}`
                                                : "Historical performance record"}
                                        </DialogDescription>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => handleDeleteSnapshot(selectedSnapshot._id, e)}
                                        disabled={isDeletingSnapshot}
                                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </DialogHeader>

                                {/* Snapshot Metric Cards */}
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <div className="rounded-xl border border-[#0F2D29]/10 bg-[#0F8A65]/5 p-3">
                                        <p className="text-[11px] font-bold text-[#5B6E68]">Tasks Completed</p>
                                        <p className="text-lg font-black text-[#0F2D29] mt-1">
                                            {selectedSnapshot.metrics.tasks.completed}/{selectedSnapshot.metrics.tasks.total}
                                        </p>
                                        <p className="text-[10px] font-medium text-[#0F8A65]">
                                            {selectedSnapshot.metrics.tasks.storyPointsCompleted} story pts
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-[#0F2D29]/10 bg-[#2563EB]/5 p-3">
                                        <p className="text-[11px] font-bold text-[#5B6E68]">Time Tracked</p>
                                        <p className="text-lg font-black text-[#0F2D29] mt-1">
                                            {selectedSnapshot.metrics.timeTracking.totalHoursLogged} hrs
                                        </p>
                                        <p className="text-[10px] font-medium text-[#2563EB]">
                                            {selectedSnapshot.metrics.timeTracking.entriesCount} entries
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-[#0F2D29]/10 bg-[#7C3AED]/5 p-3">
                                        <p className="text-[11px] font-bold text-[#5B6E68]">Sprint Velocity</p>
                                        <p className="text-lg font-black text-[#0F2D29] mt-1">
                                            {selectedSnapshot.metrics.sprints.velocity} pts
                                        </p>
                                        <p className="text-[10px] font-medium text-[#7C3AED]">
                                            {selectedSnapshot.metrics.sprints.activeCount} active sprints
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-[#0F2D29]/10 bg-[#DC2626]/5 p-3">
                                        <p className="text-[11px] font-bold text-[#5B6E68]">Overdue Tasks</p>
                                        <p className="text-lg font-black text-[#0F2D29] mt-1">
                                            {selectedSnapshot.metrics.tasks.overdue}
                                        </p>
                                        <p className="text-[10px] font-medium text-[#DC2626]">past due date</p>
                                    </div>
                                </div>

                                {/* Status & Priority breakdown */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Status */}
                                    <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-4">
                                        <h5 className="text-xs font-black text-[#0F2D29] uppercase tracking-wide flex items-center gap-1.5 mb-3">
                                            <BarChart3 size={14} className="text-[#0F8A65]" /> Status Breakdown
                                        </h5>
                                        <div className="space-y-2.5">
                                            {Object.entries(selectedSnapshot.metrics.breakdownByStatus || {}).map(([st, count]) => {
                                                const pct = selectedSnapshot.metrics.tasks.total > 0
                                                    ? Math.round((count / selectedSnapshot.metrics.tasks.total) * 100)
                                                    : 0;
                                                return (
                                                    <div key={st} className="space-y-1">
                                                        <div className="flex justify-between text-[11.5px] font-bold text-[#0F2D29]">
                                                            <span className="capitalize">{st.replace("_", " ")}</span>
                                                            <span className="text-[#5B6E68]">{count} ({pct}%)</span>
                                                        </div>
                                                        <div className="h-1.5 w-full rounded-full bg-[#0F2D29]/5 overflow-hidden">
                                                            <div className="h-full rounded-full bg-[#0F8A65]" style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-4">
                                        <h5 className="text-xs font-black text-[#0F2D29] uppercase tracking-wide flex items-center gap-1.5 mb-3">
                                            <Zap size={14} className="text-[#D97706]" /> Priority Breakdown
                                        </h5>
                                        <div className="space-y-2.5">
                                            {Object.entries(selectedSnapshot.metrics.breakdownByPriority || {}).map(([pr, count]) => {
                                                const pct = selectedSnapshot.metrics.tasks.total > 0
                                                    ? Math.round((count / selectedSnapshot.metrics.tasks.total) * 100)
                                                    : 0;
                                                return (
                                                    <div key={pr} className="space-y-1">
                                                        <div className="flex justify-between text-[11.5px] font-bold text-[#0F2D29]">
                                                            <span className="capitalize">{pr}</span>
                                                            <span className="text-[#5B6E68]">{count} ({pct}%)</span>
                                                        </div>
                                                        <div className="h-1.5 w-full rounded-full bg-[#0F2D29]/5 overflow-hidden">
                                                            <div className="h-full rounded-full bg-[#D97706]" style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Contributors */}
                                <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-4">
                                    <h5 className="text-xs font-black text-[#0F2D29] uppercase tracking-wide flex items-center gap-1.5 mb-3">
                                        <Users size={14} className="text-[#2563EB]" /> Top Contributors
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {(selectedSnapshot.metrics.team?.topContributors || []).map((c, idx) => {
                                            const u = typeof c.user === "object" ? c.user : null;
                                            const uname = u?.name || `Teammate ${idx + 1}`;
                                            return (
                                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-[#0F2D29]/8 bg-[#0F2D29]/2 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F2D29] text-[10px] font-bold text-white">
                                                            {uname.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#0F2D29]">{uname}</p>
                                                            <p className="text-[10px] text-[#5B6E68]">{c.minutesLogged} mins logged</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-extrabold text-[#0F8A65]">{c.tasksCompleted} done</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
        </>
    );
};

export default Analytics;
