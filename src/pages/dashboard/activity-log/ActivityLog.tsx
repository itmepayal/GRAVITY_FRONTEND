import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceActivityLogs } from "@/hooks/queries/activity-logs/use-get-workspace-activity-logs";
import { useCreateActivityLog } from "@/hooks/mutations/activity-logs/use-create-activity-log";
import type { ActivityAction, ActivityEntityType } from "@/apis/activity-log.api";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import {
    FONT_GOLDMAN,
    FONT_POPPINS,
    COMMON_CLASSES,
} from "@/components/common/design-system";

import {
    Activity,
    Filter,
    Search,
    Building2,
    Calendar,
    RefreshCw,
    Plus,
    ChevronLeft,
    ChevronRight,
    Kanban,
    CheckSquare,
    Target,
    Users,
    SlidersHorizontal,
    FileText,
    FolderGit2,
    Zap,
    ArrowRight,
    Sparkles,
} from "lucide-react";

export function ActivityLog() {
    const { openMobileNav } = useDashboardContext();

    // 1. Fetch user workspaces
    const { data: workspacesResponse, isLoading: isLoadingWorkspaces } =
        useGetUserWorkspaces();
    const workspaces = workspacesResponse?.data || [];

    // Selected workspace state (defaults to first workspace when loaded)
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

    React.useEffect(() => {
        if (workspaces.length > 0 && !selectedWorkspaceId) {
            setSelectedWorkspaceId(workspaces[0]._id || workspaces[0].id);
        }
    }, [workspaces, selectedWorkspaceId]);

    // 2. Filter & Pagination state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEntityType, setSelectedEntityType] = useState<
        ActivityEntityType | "all"
    >("all");
    const [selectedAction, setSelectedAction] = useState<ActivityAction | "all">(
        "all",
    );
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // 3. Query Hook for Activity Logs
    const queryParams = useMemo(() => {
        return {
            entityType:
                selectedEntityType !== "all" ? selectedEntityType : undefined,
            action: selectedAction !== "all" ? selectedAction : undefined,
            page: currentPage,
            limit: itemsPerPage,
        };
    }, [selectedEntityType, selectedAction, currentPage]);

    const {
        data: logsResponse,
        isLoading: isLoadingLogs,
        isRefetching,
        refetch,
    } = useGetWorkspaceActivityLogs(selectedWorkspaceId, queryParams);

    // 4. Mutation Hook for creating manual activity logs
    const { mutate: createLog, isPending: isCreatingLog } =
        useCreateActivityLog();

    const rawLogs = logsResponse?.data || [];
    const meta = logsResponse?.meta || {
        total: rawLogs.length,
        page: currentPage,
        limit: itemsPerPage,
        totalPages: Math.ceil(rawLogs.length / itemsPerPage) || 1,
        hasNextPage: false,
        hasPrevPage: false,
    };

    // Client-side search filtering
    const filteredLogs = useMemo(() => {
        if (!searchQuery.trim()) return rawLogs;
        const q = searchQuery.toLowerCase();
        return rawLogs.filter((log) => {
            const actorName =
                typeof log.actor === "object" ? log.actor.name?.toLowerCase() : "";
            const entityName = log.entityName?.toLowerCase() || "";
            const actionStr = log.action?.toLowerCase() || "";
            const entityTypeStr = log.entityType?.toLowerCase() || "";
            return (
                actorName.includes(q) ||
                entityName.includes(q) ||
                actionStr.includes(q) ||
                entityTypeStr.includes(q)
            );
        });
    }, [rawLogs, searchQuery]);

    const activeWorkspaceName =
        workspaces.find(
            (w: any) => (w._id || w.id) === selectedWorkspaceId,
        )?.name ?? "Workspace";

    // Dashboard Metric Cards matching Workspaces & Projects page
    const metricCards = [
        {
            title: "Logged Events",
            value: meta.total || rawLogs.length,
            subtitle: "Recorded workspace activities",
            icon: Activity,
            accentColor: "#0F2D29",
            bgGradient: "from-[#0F2D29]/5 to-transparent",
        },
        {
            title: "Active Scope",
            value: activeWorkspaceName,
            subtitle: `${workspaces.length} workspaces available`,
            icon: Building2,
            accentColor: "#0F8A65",
            bgGradient: "from-[#0F8A65]/10 to-transparent",
        },
        {
            title: "Entity Filter",
            value:
                selectedEntityType === "all"
                    ? "All Types"
                    : selectedEntityType.toUpperCase(),
            subtitle: `Action: ${selectedAction.replace("_", " ")}`,
            icon: Filter,
            accentColor: "#7C3AED",
            bgGradient: "from-[#7C3AED]/10 to-transparent",
        },
        {
            title: "Audit Stream",
            value: "Live Sync",
            subtitle: "Real-time query execution",
            icon: Sparkles,
            accentColor: "#D97706",
            bgGradient: "from-[#D97706]/10 to-transparent",
        },
    ];

    // Entity Icon Helper
    const getEntityBadge = (type: ActivityEntityType) => {
        switch (type) {
            case "project":
                return {
                    icon: FolderGit2,
                    bg: "bg-purple-50 text-purple-800 border-purple-200",
                };
            case "task":
                return {
                    icon: CheckSquare,
                    bg: "bg-blue-50 text-blue-800 border-blue-200",
                };
            case "board":
                return {
                    icon: Kanban,
                    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
                };
            case "sprint":
                return {
                    icon: Zap,
                    bg: "bg-amber-50 text-amber-800 border-amber-200",
                };
            case "goal":
                return {
                    icon: Target,
                    bg: "bg-rose-50 text-rose-800 border-rose-200",
                };
            case "team":
                return {
                    icon: Users,
                    bg: "bg-indigo-50 text-indigo-800 border-indigo-200",
                };
            case "workspace":
                return {
                    icon: Building2,
                    bg: "bg-teal-50 text-teal-800 border-teal-200",
                };
            default:
                return {
                    icon: FileText,
                    bg: "bg-gray-50 text-gray-800 border-gray-200",
                };
        }
    };

    const getActionBadgeClass = (action: ActivityAction) => {
        switch (action) {
            case "created":
                return "text-[#0F8A65] bg-[#0F8A65]/10 border-[#0F8A65]/30";
            case "updated":
            case "status_changed":
                return "text-blue-700 bg-blue-50 border-blue-200";
            case "deleted":
                return "text-rose-700 bg-rose-50 border-rose-200";
            case "assigned":
            case "member_added":
                return "text-purple-700 bg-purple-50 border-purple-200";
            case "commented":
                return "text-amber-700 bg-amber-50 border-amber-200";
            default:
                return "text-gray-700 bg-gray-50 border-gray-200";
        }
    };

    // Quick Test Activity Trigger
    const handleTestCreateLog = () => {
        if (!selectedWorkspaceId) return;
        createLog({
            workspace: selectedWorkspaceId,
            action: "created",
            entityType: "task",
            entityId: "665f5a1e8b3f4a0012a3cd10",
            entityName: "Sample Task Entry",
            metadata: { trigger: "ActivityLog Dashboard Page" },
        });
    };

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedEntityType("all");
        setSelectedAction("all");
        setCurrentPage(1);
    };

    return (
        <>
            <Topbar
                variant="light"
                title="Activity Log & Audit Trail"
                subtitle={`${activeWorkspaceName} · ${meta.total || rawLogs.length} Events Logged`}
                onMenuClick={openMobileNav}
            />

            <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Workspace & Project Style Metrics Banner */}
                <DashboardMetricsBanner cards={metricCards} />

                {/* Workspace & Project Style Filter Toolbar */}
                <div className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Left Controls: Workspace & Search */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Workspace Dropdown */}
                            <div className="min-w-[200px]">
                                <label className={COMMON_CLASSES.labelUppercase}>
                                    Workspace Scope
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedWorkspaceId}
                                        onChange={(e) => {
                                            setSelectedWorkspaceId(e.target.value);
                                            setCurrentPage(1);
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

                            {/* Search Box */}
                            <div className="min-w-[260px] flex-1">
                                <label className={COMMON_CLASSES.labelUppercase}>
                                    Search Audit Logs
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by user, title, or action..."
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

                        {/* Right Controls: Filters & Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Entity Type Filter */}
                            <div className="min-w-[150px]">
                                <label className={COMMON_CLASSES.labelUppercase}>
                                    Entity Type
                                </label>
                                <select
                                    value={selectedEntityType}
                                    onChange={(e) => {
                                        setSelectedEntityType(
                                            e.target.value as ActivityEntityType | "all",
                                        );
                                        setCurrentPage(1);
                                    }}
                                    className={COMMON_CLASSES.selectBase + " w-full"}
                                >
                                    <option value="all">All Entities</option>
                                    <option value="project">Projects</option>
                                    <option value="task">Tasks</option>
                                    <option value="board">Boards</option>
                                    <option value="sprint">Sprints</option>
                                    <option value="goal">Goals</option>
                                    <option value="team">Teams</option>
                                    <option value="workspace">Workspace</option>
                                </select>
                            </div>

                            {/* Action Filter */}
                            <div className="min-w-[150px]">
                                <label className={COMMON_CLASSES.labelUppercase}>
                                    Action Type
                                </label>
                                <select
                                    value={selectedAction}
                                    onChange={(e) => {
                                        setSelectedAction(e.target.value as ActivityAction | "all");
                                        setCurrentPage(1);
                                    }}
                                    className={COMMON_CLASSES.selectBase + " w-full"}
                                >
                                    <option value="all">All Actions</option>
                                    <option value="created">Created</option>
                                    <option value="updated">Updated</option>
                                    <option value="deleted">Deleted</option>
                                    <option value="status_changed">Status Changed</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="commented">Commented</option>
                                    <option value="member_added">Member Added</option>
                                    <option value="member_removed">Member Removed</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-end gap-2 pt-5">
                                <button
                                    onClick={handleTestCreateLog}
                                    disabled={isCreatingLog || !selectedWorkspaceId}
                                    className={COMMON_CLASSES.btnPrimary}
                                >
                                    <Plus size={15} />
                                    {isCreatingLog ? "Logging..." : "Test Log"}
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
                                    title="Refresh Stream"
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

                {/* Activity Stream Container */}
                <div className="border border-[#0F2D29]/15 bg-white p-6 shadow-2xs">
                    <div className="mb-6 flex items-center justify-between border-b border-[#0F2D29]/10 pb-4">
                        <h3 className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}>
                            <Activity className="text-[#0F8A65]" size={18} />
                            Workspace Activity Stream
                        </h3>
                        <span className={`${FONT_GOLDMAN} bg-[#0F2D29]/6 text-[#0F2D29] border border-[#0F2D29]/15 px-3 py-1 text-xs font-bold`}>
                            {filteredLogs.length} Entries
                        </span>
                    </div>

                    {isLoadingLogs ? (
                        /* Skeleton Loading State */
                        <div className="space-y-4 py-8">
                            {[...Array(5)].map((_, i) => (
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
                    ) : filteredLogs.length === 0 ? (
                        /* Empty State matching Workspace PanelEmpty */
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0F2D29]/6 text-[#0F8A65] mb-4 border border-[#0F2D29]/12">
                                <Activity size={32} />
                            </div>
                            <h4 className={`${COMMON_CLASSES.headingTitle} text-base`}>
                                No activity logs found
                            </h4>
                            <p className={`${COMMON_CLASSES.headingSubtitle} mt-1 max-w-md`}>
                                No activity entries match your current search or filter criteria for this workspace. Try adjusting your scope or filters.
                            </p>
                            <button
                                onClick={resetFilters}
                                className={`${COMMON_CLASSES.btnPrimary} mt-5`}
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        /* Audit Stream Timeline */
                        <div className="relative border-l-2 border-[#0F2D29]/15 ml-4 space-y-5">
                            {filteredLogs.map((log) => {
                                const actorObj = typeof log.actor === "object" ? log.actor : null;
                                const actorName = actorObj?.name || "System User";
                                const actorEmail = actorObj?.email || "";
                                const entityBadge = getEntityBadge(log.entityType);
                                const EntityIcon = entityBadge.icon;
                                const actionBadgeClass = getActionBadgeClass(log.action);
                                const formattedDate = new Date(log.createdAt).toLocaleString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    },
                                );

                                return (
                                    <div key={log._id || log.id} className="relative pl-6 group">
                                        {/* Timeline Dot Node */}
                                        <div className="absolute -left-3.5 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-[#0F2D29]/20 bg-[#0F2D29] text-white shadow-xs transition-transform group-hover:scale-110">
                                            <EntityIcon size={13} />
                                        </div>

                                        {/* Log Entry Card */}
                                        <div className={COMMON_CLASSES.cardBase}>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                {/* User & Action Info */}
                                                <div className="flex items-center gap-3">
                                                    {actorObj?.avatar ? (
                                                        <img
                                                            src={actorObj.avatar}
                                                            alt={actorName}
                                                            className="h-9 w-9 rounded-full object-cover border border-[#0F2D29]/15"
                                                        />
                                                    ) : (
                                                        <div className={`${FONT_GOLDMAN} flex h-9 w-9 items-center justify-center rounded-full bg-[#0F2D29] text-white font-bold text-xs`}>
                                                            {actorName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`${FONT_GOLDMAN} font-bold text-[13.5px] text-[#0F2D29]`}>
                                                                {actorName}
                                                            </span>
                                                            {actorEmail && (
                                                                <span className={`${FONT_POPPINS} text-[11.5px] text-[#5B6E68] hidden md:inline`}>
                                                                    ({actorEmail})
                                                                </span>
                                                            )}
                                                            <span
                                                                className={`${FONT_GOLDMAN} uppercase border px-2 py-0.5 text-[10.5px] font-bold ${actionBadgeClass}`}
                                                            >
                                                                {log.action.replace("_", " ")}
                                                            </span>
                                                        </div>

                                                        <p className={`${FONT_POPPINS} mt-1 text-[12.5px] text-[#5B6E68] flex items-center gap-1.5`}>
                                                            <span
                                                                className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10.5px] font-bold ${FONT_GOLDMAN} uppercase ${entityBadge.bg}`}
                                                            >
                                                                <EntityIcon size={11} />
                                                                {log.entityType}
                                                            </span>
                                                            <ArrowRight size={12} className="text-[#8FA69E]" />
                                                            <span className="font-bold text-[#0F2D29]">
                                                                {log.entityName || log.entityId}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Date Timestamp */}
                                                <div className={`${FONT_POPPINS} flex items-center gap-1.5 text-[11.5px] font-medium text-[#5B6E68] shrink-0`}>
                                                    <Calendar size={13} className="text-[#8FA69E]" />
                                                    <span>{formattedDate}</span>
                                                </div>
                                            </div>

                                            {/* Optional Metadata Details */}
                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                <div className="mt-3 border-t border-[#0F2D29]/8 pt-2.5">
                                                    <span className={`${FONT_GOLDMAN} text-[11px] font-bold text-[#5B6E68] uppercase tracking-wider block mb-1`}>
                                                        Metadata:
                                                    </span>
                                                    <pre className="font-mono text-[11px] text-[#0F2D29] bg-[#0F2D29]/4 p-2.5 border border-[#0F2D29]/10 overflow-x-auto">
                                                        {JSON.stringify(log.metadata, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination Controls matching Workspace & Project tables */}
                    {meta.totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-between border-t border-[#0F2D29]/10 pt-4">
                            <p className={`${FONT_POPPINS} text-[12px] font-medium text-[#5B6E68]`}>
                                Page <span className={`${FONT_GOLDMAN} font-bold text-[#0F2D29]`}>{meta.page}</span> of{" "}
                                <span className={`${FONT_GOLDMAN} font-bold text-[#0F2D29]`}>{meta.totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={!meta.hasPrevPage && currentPage === 1}
                                    className={COMMON_CLASSES.btnSecondary + " disabled:opacity-40"}
                                >
                                    <ChevronLeft size={14} />
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    disabled={!meta.hasNextPage && currentPage >= meta.totalPages}
                                    className={COMMON_CLASSES.btnSecondary + " disabled:opacity-40"}
                                >
                                    Next
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

export default ActivityLog;