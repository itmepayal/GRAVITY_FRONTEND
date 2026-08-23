import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useGetDashboardStats } from "@/hooks/queries/dashboard/use-get-dashboard-stats";
import { useCreateTask } from "@/hooks/mutations/task/use-create-task";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import {
    Building2,
    CheckCircle2,
    Clock,
    FolderKanban,
    GitBranch,
    ListTodo,
    Loader2,
    RefreshCw,
    Users,
    AlertTriangle,
    ArrowUpRight,
    Sparkles,
    BarChart3,
    Activity,
    Calendar,

    CreditCard,
    Link2,
    Plus,
    Compass,
    TrendingUp,
    Search,
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

type DashboardTab = "overview" | "tasks_matrix" | "projects_grid" | "activity_stream" | "architecture";

export default function Dashboard() {
    const { openMobileNav } = useDashboardContext();
    const user = useAuthStore((s) => s.user);
    const firstName = user?.name?.split(" ")[0] ?? "there";

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
    const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
    // const [timeHorizon, setTimeHorizon] = useState<"today" | "week" | "month" | "all">("week");
    const [taskFilterStatus, setTaskFilterStatus] = useState<string>("all");
    const [activitySearchQuery, setActivitySearchQuery] = useState<string>("");

    // Projects query for Projects Grid tab
    const { data: projectsData, isLoading: isLoadingProjects } = useGetWorkspaceProjects(selectedWorkspace || activeWorkspaceId);
    const projectsList = useMemo(() => {
        const raw = Array.isArray(projectsData) ? projectsData : (projectsData?.data ?? []);
        return raw;
    }, [projectsData]);

    // Modal state for Task Details & Quick Create Task
    const [selectedTaskForModal, setSelectedTaskForModal] = useState<any | null>(null);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskProjectId, setNewTaskProjectId] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

    const { mutate: createQuickTask, isPending: isCreatingTask } = useCreateTask();

    React.useEffect(() => {
        if (activeWorkspaceId && !selectedWorkspace) {
            setSelectedWorkspace(activeWorkspaceId);
        }
    }, [activeWorkspaceId, selectedWorkspace]);

    // Query Dashboard Stats
    const {
        data: statsData,
        isLoading: isLoadingStats,
        isRefetching,
        refetch,
    } = useGetDashboardStats(selectedWorkspace || undefined);

    const stats = statsData?.data;

    const handleCreateTaskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetWs = selectedWorkspace || activeWorkspaceId;
        if (!targetWs) {
            toast.error("Please select a workspace first.");
            return;
        }

        if (!newTaskTitle.trim()) {
            toast.error("Task title is required.");
            return;
        }

        createQuickTask(
            {
                title: newTaskTitle,
                workspace: targetWs,
                project: newTaskProjectId || (projectsList[0]?._id ?? projectsList[0]?.id),
                priority: newTaskPriority,
            },
            {
                onSuccess: () => {
                    toast.success("Quick task created successfully!");
                    setIsCreateTaskModalOpen(false);
                    setNewTaskTitle("");
                    refetch();
                },
                onError: (err: any) => {
                    toast.error(err?.message || "Failed to create task.");
                },
            }
        );
    };

    const bannerCards = [
        {
            title: "Total Projects",
            value: stats?.projectsCount || 0,
            subtitle: "Active workspace projects",
            icon: FolderKanban,
            accentColor: "#2563EB",
            bgGradient: "from-[#2563EB]/10 to-transparent",
        },
        {
            title: "Tasks Delivered",
            value: stats ? `${stats.tasks.completed}/${stats.tasks.total}` : 0,
            subtitle: `${stats?.tasks.completionRate || 0}% completion rate`,
            icon: CheckCircle2,
            accentColor: "#0F8A65",
            bgGradient: "from-[#0F8A65]/10 to-transparent",
        },
        {
            title: "Hours Logged",
            value: `${stats?.totalHoursLogged || 0} hrs`,
            subtitle: "Tracked execution time",
            icon: Clock,
            accentColor: "#7C3AED",
            bgGradient: "from-[#7C3AED]/10 to-transparent",
        },
        {
            title: "Team Members",
            value: stats?.teamMembersCount || 1,
            subtitle: "Active collaborators",
            icon: Users,
            accentColor: "#D97706",
            bgGradient: "from-[#D97706]/10 to-transparent",
        },
    ];

    const quickLinks = [
        { name: "My Tasks", path: "/dashboard/tasks", icon: ListTodo, color: "text-[#0F8A65] bg-[#0F8A65]/10" },
        { name: "Projects", path: "/dashboard/projects", icon: FolderKanban, color: "text-[#2563EB] bg-[#2563EB]/10" },
        { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3, color: "text-[#7C3AED] bg-[#7C3AED]/10" },
        { name: "Integrations", path: "/dashboard/integration", icon: Link2, color: "text-[#D97706] bg-[#D97706]/10" },
        { name: "Billing", path: "/dashboard/billing", icon: CreditCard, color: "text-[#00A86B] bg-[#00A86B]/10" },
    ];

    // Filter recent tasks for Matrix view
    const filteredTasks = useMemo(() => {
        const tasks = stats?.recentTasks || [];
        if (taskFilterStatus === "all") return tasks;
        if (taskFilterStatus === "overdue") {
            const now = new Date();
            return tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "completed");
        }
        return tasks.filter((t) => t.status === taskFilterStatus);
    }, [stats?.recentTasks, taskFilterStatus]);

    // Filter activities for Feed view
    const filteredActivities = useMemo(() => {
        const activities = stats?.recentActivities || [];
        if (!activitySearchQuery.trim()) return activities;
        const q = activitySearchQuery.toLowerCase();
        return activities.filter(
            (act) =>
                act.user?.name?.toLowerCase().includes(q) ||
                act.action?.toLowerCase().includes(q)
        );
    }, [stats?.recentActivities, activitySearchQuery]);

    const handleNodeClick = (nodeName: string, detailInfo: string) => {
        toast.info(`Topology Node: ${nodeName}`, {
            description: detailInfo,
        });
    };

    return (
        <>
            <Topbar
                title="Executive Dashboard"
                subtitle="Interactive real-time workspace intelligence, velocity tracking, and execution topology"
                onMenuClick={openMobileNav}
            />

            <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Hero Banner with Glassmorphism & Accent Gradient */}
                <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#0F2D29] via-[#0F8A65]/90 to-[#0F2D29] p-6 sm:p-8 text-white shadow-xl">
                    <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
                    <div className="absolute right-1/3 -top-10 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />

                    <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur-md">
                                <Sparkles size={14} className="text-[#8FE3C4]" />
                                Live Workspace Intelligence
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                Welcome back, {firstName}!
                            </h2>
                            <p className="max-w-xl text-xs sm:text-sm font-medium text-emerald-100/90 leading-relaxed">
                                Here is your high-level overview across projects, task velocity, team output, and active workflows today.
                            </p>
                        </div>

                        {/* Workspace Selector & Quick Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreateTaskModalOpen(true)}
                                className="flex items-center gap-1.5 rounded-2xl bg-[#8FE3C4] px-4 py-2 text-xs font-black text-[#0F2D29] transition-transform hover:scale-105 active:scale-95 shadow-md"
                            >
                                <Plus size={16} />
                                Quick Task
                            </button>

                            {/* Workspace Dropdown */}
                            <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2 shadow-inner backdrop-blur-md">
                                <Building2 size={16} className="text-[#8FE3C4]" />
                                <select
                                    value={selectedWorkspace || activeWorkspaceId}
                                    onChange={(e) => setSelectedWorkspace(e.target.value)}
                                    disabled={isLoadingWorkspaces}
                                    className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                                >
                                    <option value="" className="text-[#0F2D29]">All Workspaces</option>
                                    {workspaces.map((w) => (
                                        <option key={w.id} value={w.id} className="text-[#0F2D29]">
                                            {w.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => refetch()}
                                disabled={isRefetching || isLoadingStats}
                                className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black text-[#0F2D29] transition-transform hover:scale-105 active:scale-95 shadow-md disabled:opacity-50"
                            >
                                <RefreshCw size={14} className={isRefetching ? "animate-spin text-[#0F8A65]" : "text-[#0F8A65]"} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Metric Banner matched with Workspaces/Projects design */}
                <DashboardMetricsBanner cards={bannerCards} />

                {/* Interactive View Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-[#0F2D29]/10 pb-1">
                    <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab("overview")}
                            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === "overview"
                                ? "text-[#0F2D29] border-b-2 border-[#0F8A65]"
                                : "text-[#0F2D29]/50 hover:text-[#0F2D29]"
                                }`}
                        >
                            <Compass size={15} /> Overview & Metrics
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("tasks_matrix")}
                            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === "tasks_matrix"
                                ? "text-[#0F2D29] border-b-2 border-[#0F8A65]"
                                : "text-[#0F2D29]/50 hover:text-[#0F2D29]"
                                }`}
                        >
                            <ListTodo size={15} /> Task Matrix ({stats?.recentTasks?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("projects_grid")}
                            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === "projects_grid"
                                ? "text-[#0F2D29] border-b-2 border-[#0F8A65]"
                                : "text-[#0F2D29]/50 hover:text-[#0F2D29]"
                                }`}
                        >
                            <FolderKanban size={15} /> Workspace Projects ({projectsList.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("activity_stream")}
                            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === "activity_stream"
                                ? "text-[#0F2D29] border-b-2 border-[#0F8A65]"
                                : "text-[#0F2D29]/50 hover:text-[#0F2D29]"
                                }`}
                        >
                            <Activity size={15} /> Audit Stream ({stats?.recentActivities?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("architecture")}
                            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === "architecture"
                                ? "text-[#0F2D29] border-b-2 border-[#0F8A65]"
                                : "text-[#0F2D29]/50 hover:text-[#0F2D29]"
                                }`}
                        >
                            <GitBranch size={15} /> Topology Graph
                        </button>
                    </div>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Quick Navigation Shortcuts Row */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            {quickLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className="group flex items-center justify-between rounded-2xl border border-[#0F2D29]/12 bg-white p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-[#0F8A65]/40 hover:shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${link.color}`}>
                                                <Icon size={18} />
                                            </div>
                                            <span className="text-xs font-bold text-[#0F2D29] group-hover:text-[#0F8A65] transition-colors">
                                                {link.name}
                                            </span>
                                        </div>
                                        <ArrowUpRight size={14} className="text-[#5B6E68]/40 group-hover:text-[#0F8A65] transition-colors" />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Main Grid: Status Breakdown & Dependency Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Status Distribution Panel */}
                            <div className="rounded-3xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-[#0F2D29]/10">
                                    <div>
                                        <h4 className="text-sm font-black text-[#0F2D29] uppercase tracking-wide flex items-center gap-2">
                                            <BarChart3 size={16} className="text-[#0F8A65]" /> Task Breakdown
                                        </h4>
                                        <p className="text-[11.5px] font-medium text-[#5B6E68] mt-0.5">
                                            Live workflow column distribution
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-[#0F8A65]/10 px-2.5 py-0.5 text-xs font-bold text-[#0F8A65]">
                                        {stats?.tasks.total || 0} Tasks
                                    </span>
                                </div>

                                {isLoadingStats ? (
                                    <div className="flex min-h-48 items-center justify-center">
                                        <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-1">
                                        {Object.entries(stats?.statusBreakdown || {}).map(([statusKey, count]) => {
                                            const total = stats?.tasks.total || 1;
                                            const pct = Math.round((count / total) * 100);
                                            const formattedStatus = statusKey.replace("_", " ");

                                            return (
                                                <div
                                                    key={statusKey}
                                                    onClick={() => {
                                                        setTaskFilterStatus(statusKey);
                                                        setActiveTab("tasks_matrix");
                                                    }}
                                                    className="space-y-1.5 cursor-pointer group"
                                                >
                                                    <div className="flex justify-between text-xs font-bold text-[#0F2D29] group-hover:text-[#0F8A65] transition-colors">
                                                        <span className="capitalize">{formattedStatus}</span>
                                                        <span className="text-[#5B6E68]">
                                                            {count} ({pct}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-[#0F2D29]/5 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-[#0F8A65] transition-all duration-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Overdue Alert Widget */}
                                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2.5 text-amber-900 font-bold">
                                        <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                                        <div>
                                            <p className="font-extrabold">{stats?.tasks.overdue || 0} Overdue Tasks</p>
                                            <p className="text-[10.5px] text-amber-700/80 font-medium">Past specified due date</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTaskFilterStatus("overdue");
                                            setActiveTab("tasks_matrix");
                                        }}
                                        className="rounded-xl bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-700 transition-colors"
                                    >
                                        Filter
                                    </button>
                                </div>
                            </div>

                            {/* High-Tech Dependency & Execution Flow Graph */}
                            <div className="lg:col-span-2 rounded-3xl bg-[#0F2D29] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between text-white border border-[#0F8A65]/30">
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <div>
                                        <p className="text-[10.5px] uppercase tracking-wider text-[#8FE3C4] font-black">
                                            Execution Architecture
                                        </p>
                                        <p className="text-white text-base font-bold mt-0.5">
                                            Interactive Dependency Topology
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-[11px] text-[#8FE3C4] bg-[#8FE3C4]/10 px-3 py-1 rounded-full font-bold">
                                        <span className="w-2 h-2 rounded-full bg-[#8FE3C4] animate-ping" />
                                        Interactive Nodes
                                    </span>
                                </div>

                                {/* Interactive SVG Flow Diagram */}
                                <div className="py-6 relative">
                                    <svg viewBox="0 0 100 50" className="w-full h-48 sm:h-56">
                                        <defs>
                                            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#0F8A65" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#8FE3C4" stopOpacity="1" />
                                            </linearGradient>
                                        </defs>

                                        <line x1="20" y1="25" x2="50" y2="15" stroke="url(#flowGrad)" strokeWidth="1" strokeDasharray="3,3" />
                                        <line x1="20" y1="25" x2="50" y2="35" stroke="url(#flowGrad)" strokeWidth="1" strokeDasharray="3,3" />
                                        <line x1="50" y1="15" x2="80" y2="25" stroke="#8FE3C4" strokeWidth="1.2" />
                                        <line x1="50" y1="35" x2="80" y2="25" stroke="#8FE3C4" strokeWidth="1.2" />

                                        {/* Node 1: Workspaces */}
                                        <g
                                            transform="translate(20,25)"
                                            onClick={() => handleNodeClick("Workspaces", `${stats?.workspacesCount || 0} active workspaces accessible`)}
                                            className="cursor-pointer transition-transform hover:scale-110"
                                        >
                                            <circle r="7" fill="#0F8A65" stroke="#8FE3C4" strokeWidth="1.5" />
                                            <text y="13" textAnchor="middle" fill="#B7CFC7" fontSize="3.8" fontWeight="bold">
                                                Workspaces ({stats?.workspacesCount || 0})
                                            </text>
                                        </g>

                                        {/* Node 2: Projects */}
                                        <g
                                            transform="translate(50,15)"
                                            onClick={() => handleNodeClick("Projects", `${stats?.projectsCount || 0} projects configured in workspace`)}
                                            className="cursor-pointer transition-transform hover:scale-110"
                                        >
                                            <circle r="7" fill="#2563EB" stroke="#60A5FA" strokeWidth="1.5" />
                                            <text y="13" textAnchor="middle" fill="#B7CFC7" fontSize="3.8" fontWeight="bold">
                                                Projects ({stats?.projectsCount || 0})
                                            </text>
                                        </g>

                                        {/* Node 3: In Progress */}
                                        <g
                                            transform="translate(50,35)"
                                            onClick={() => {
                                                setTaskFilterStatus("in_progress");
                                                setActiveTab("tasks_matrix");
                                            }}
                                            className="cursor-pointer transition-transform hover:scale-110"
                                        >
                                            <circle r="7" fill="#D97706" stroke="#FBBF24" strokeWidth="1.5" />
                                            <text y="13" textAnchor="middle" fill="#B7CFC7" fontSize="3.8" fontWeight="bold">
                                                In Progress ({stats?.tasks.inProgress || 0})
                                            </text>
                                        </g>

                                        {/* Node 4: Delivered Tasks */}
                                        <g
                                            transform="translate(80,25)"
                                            onClick={() => {
                                                setTaskFilterStatus("completed");
                                                setActiveTab("tasks_matrix");
                                            }}
                                            className="cursor-pointer transition-transform hover:scale-110"
                                        >
                                            <circle r="8.5" fill="#0F8A65" stroke="#8FE3C4" strokeWidth="2" />
                                            <text y="15" textAnchor="middle" fill="#8FE3C4" fontSize="4.2" fontWeight="black">
                                                Delivered ({stats?.tasks.completed || 0})
                                            </text>
                                        </g>
                                    </svg>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-white/10 text-xs text-[#B7CFC7] gap-2">
                                    <span className="flex items-center gap-2">
                                        <Activity size={15} className="text-[#8FE3C4]" />
                                        Click nodes to filter tasks or view node topology
                                    </span>
                                    <span className="font-bold text-white flex items-center gap-1">
                                        <TrendingUp size={14} className="text-[#8FE3C4]" />
                                        {stats?.tasks.completionRate || 0}% Workspace Completion Rate
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Tasks & Audit Feed */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Active Tasks Table */}
                            <div className="lg:col-span-2 rounded-3xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-[#0F2D29]/10">
                                    <div>
                                        <h4 className="text-base font-black text-[#0F2D29]">Recent Active Tasks</h4>
                                        <p className="text-xs text-[#5B6E68] mt-0.5">
                                            Latest tasks created or modified across active projects
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("tasks_matrix")}
                                        className="flex items-center gap-1 text-xs font-bold text-[#0F8A65] hover:underline"
                                    >
                                        View Full Matrix <ArrowUpRight size={13} />
                                    </button>
                                </div>

                                {isLoadingStats ? (
                                    <div className="flex min-h-36 items-center justify-center">
                                        <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
                                    </div>
                                ) : !stats?.recentTasks || stats.recentTasks.length === 0 ? (
                                    <div className="py-8 text-center text-xs font-medium text-[#5B6E68]">
                                        <ListTodo size={24} className="mx-auto mb-2 text-[#5B6E68]/40" />
                                        No recent tasks recorded in this workspace.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#0F2D29]/8">
                                        {stats.recentTasks.map((t: any) => {
                                            const projName = t.project?.name || "Workspace Task";
                                            return (
                                                <div
                                                    key={t._id}
                                                    onClick={() => setSelectedTaskForModal(t)}
                                                    className="group flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-3 rounded-xl hover:bg-[#0F8A65]/5 transition-colors gap-2 cursor-pointer"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="rounded-md bg-[#0F8A65]/10 px-2 py-0.5 text-[10px] font-bold text-[#0F8A65]">
                                                                {projName}
                                                            </span>
                                                            <span className="text-xs font-bold text-[#0F2D29] group-hover:text-[#0F8A65] transition-colors line-clamp-1">
                                                                {t.title}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                                                        <span
                                                            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${t.status === "completed"
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : t.status === "in_progress"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-gray-100 text-gray-700"
                                                                }`}
                                                        >
                                                            {t.status.replace("_", " ")}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedTaskForModal(t);
                                                            }}
                                                            className="rounded-lg p-1 text-[#5B6E68] hover:bg-[#0F2D29]/10"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Activity Feed */}
                            <div className="rounded-3xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs space-y-4">
                                <div className="pb-3 border-b border-[#0F2D29]/10 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-base font-black text-[#0F2D29]">Workspace Audit Feed</h4>
                                        <p className="text-xs text-[#5B6E68] mt-0.5">
                                            Live activity stream & team events
                                        </p>
                                    </div>
                                    <Activity size={18} className="text-[#0F8A65]" />
                                </div>

                                {isLoadingStats ? (
                                    <div className="flex min-h-36 items-center justify-center">
                                        <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
                                    </div>
                                ) : !stats?.recentActivities || stats.recentActivities.length === 0 ? (
                                    <div className="py-8 text-center text-xs font-medium text-[#5B6E68]">
                                        No recent activity logged.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {stats.recentActivities.map((act: any) => {
                                            const uName = act.user?.name || "Teammate";
                                            return (
                                                <div
                                                    key={act._id}
                                                    className="flex items-start gap-3 p-3 rounded-2xl bg-[#0F2D29]/2 text-xs border border-[#0F2D29]/5"
                                                >
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F2D29] text-[10px] font-bold text-white mt-0.5 shadow-2xs">
                                                        {uName.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="font-bold text-[#0F2D29]">
                                                            {uName} <span className="font-medium text-[#5B6E68]">{act.action}</span>
                                                        </p>
                                                        <p className="text-[10.5px] font-medium text-[#5B6E68]">
                                                            {new Date(act.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: TASK EXECUTION MATRIX */}
                {activeTab === "tasks_matrix" && (
                    <div className="rounded-3xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0F2D29]/10 gap-4">
                            <div>
                                <h4 className="text-lg font-black text-[#0F2D29]">Task Execution Matrix</h4>
                                <p className="text-xs text-[#5B6E68] mt-0.5">
                                    Interactive view to filter and inspect tasks across status columns.
                                </p>
                            </div>

                            {/* Filter Pills */}
                            <div className="flex flex-wrap items-center gap-2">
                                {["all", "todo", "in_progress", "in_review", "completed", "overdue"].map((st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => setTaskFilterStatus(st)}
                                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all uppercase ${taskFilterStatus === st
                                            ? "bg-[#0F2D29] text-white shadow-2xs"
                                            : "bg-[#0F2D29]/5 text-[#5B6E68] hover:bg-[#0F2D29]/10"
                                            }`}
                                    >
                                        {st.replace("_", " ")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredTasks.length === 0 ? (
                            <div className="py-12 text-center text-xs font-medium text-[#5B6E68]">
                                No tasks match the selected status filter "{taskFilterStatus}".
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredTasks.map((t: any) => (
                                    <div
                                        key={t._id}
                                        onClick={() => setSelectedTaskForModal(t)}
                                        className="group rounded-2xl border border-[#0F2D29]/10 bg-white p-4 shadow-2xs hover:border-[#0F8A65]/40 hover:shadow-sm transition-all cursor-pointer space-y-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="rounded-md bg-[#0F8A65]/10 px-2 py-0.5 text-[10.5px] font-bold text-[#0F8A65]">
                                                {t.project?.name || "Workspace Task"}
                                            </span>
                                            <span
                                                className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${t.status === "completed"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : t.status === "in_progress"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {t.status.replace("_", " ")}
                                            </span>
                                        </div>

                                        <h5 className="text-sm font-bold text-[#0F2D29] group-hover:text-[#0F8A65] transition-colors leading-snug">
                                            {t.title}
                                        </h5>

                                        <div className="flex items-center justify-between pt-2 border-t border-[#0F2D29]/8 text-xs text-[#5B6E68]">
                                            <span className="flex items-center gap-1 font-semibold">
                                                <Calendar size={13} />
                                                {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No Due Date"}
                                            </span>

                                            <span className="font-bold text-[#0F8A65] flex items-center gap-1">
                                                Inspect <ArrowUpRight size={13} />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: WORKSPACE PROJECTS GRID */}
                {activeTab === "projects_grid" && (
                    <div className="rounded-3xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-[#0F2D29]/10">
                            <div>
                                <h4 className="text-lg font-black text-[#0F2D29]">Workspace Projects Directory</h4>
                                <p className="text-xs text-[#5B6E68] mt-0.5">
                                    All active projects configured in this workspace.
                                </p>
                            </div>
                            <Link
                                to="/dashboard/projects"
                                className="flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0F2D29]/90"
                            >
                                <Plus size={14} /> New Project
                            </Link>
                        </div>

                        {isLoadingProjects ? (
                            <div className="flex min-h-48 items-center justify-center">
                                <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
                            </div>
                        ) : projectsList.length === 0 ? (
                            <div className="py-12 text-center text-xs font-medium text-[#5B6E68]">
                                No active projects found in this workspace.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projectsList.map((p: any) => (
                                    <div
                                        key={p._id || p.id}
                                        className="group rounded-2xl border border-[#0F2D29]/12 bg-white p-5 shadow-2xs hover:border-[#0F8A65]/40 hover:shadow-sm transition-all space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                                                <FolderKanban size={20} />
                                            </div>
                                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase">
                                                Active
                                            </span>
                                        </div>

                                        <div>
                                            <h5 className="text-base font-black text-[#0F2D29] group-hover:text-[#0F8A65] transition-colors">
                                                {p.name}
                                            </h5>
                                            <p className="text-xs text-[#5B6E68] mt-1 line-clamp-2 leading-relaxed">
                                                {p.description || "Agile sprint & project tracking board."}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-[#0F2D29]/8 text-xs font-bold text-[#0F8A65]">
                                            <span>{p.members?.length || 1} Members</span>
                                            <Link to="/dashboard/projects" className="flex items-center gap-1 hover:underline">
                                                Open Board <ArrowUpRight size={13} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: WORKSPACE AUDIT STREAM */}
                {activeTab === "activity_stream" && (
                    <div className="rounded-3xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0F2D29]/10 gap-4">
                            <div>
                                <h4 className="text-lg font-black text-[#0F2D29]">Workspace Activity & Audit Stream</h4>
                                <p className="text-xs text-[#5B6E68] mt-0.5">
                                    Searchable history log of events, task modifications, and team changes.
                                </p>
                            </div>

                            {/* Search Activity Input */}
                            <div className="flex items-center gap-2 rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-1.5 shadow-2xs">
                                <Search size={14} className="text-[#5B6E68]" />
                                <input
                                    type="text"
                                    value={activitySearchQuery}
                                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                                    placeholder="Filter by user or action..."
                                    className="bg-transparent text-xs font-semibold text-[#0F2D29] outline-none w-48 sm:w-64"
                                />
                            </div>
                        </div>

                        {filteredActivities.length === 0 ? (
                            <div className="py-12 text-center text-xs font-medium text-[#5B6E68]">
                                No audit activities found matching "{activitySearchQuery}".
                            </div>
                        ) : (
                            <div className="divide-y divide-[#0F2D29]/8">
                                {filteredActivities.map((act: any) => {
                                    const uName = act.user?.name || "Teammate";
                                    return (
                                        <div
                                            key={act._id}
                                            className="flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-[#0F2D29]/2 transition-colors text-xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2D29] text-[10px] font-bold text-white">
                                                    {uName.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#0F2D29]">
                                                        {uName} <span className="font-normal text-[#5B6E68]">{act.action}</span>
                                                    </p>
                                                    <p className="text-[10.5px] text-[#5B6E68]">
                                                        Entity: {act.entityType || "Task"} · {new Date(act.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 5: SYSTEM ARCHITECTURE GRAPH */}
                {activeTab === "architecture" && (
                    <div className="rounded-3xl bg-[#0F2D29] p-8 text-white shadow-xl space-y-6">
                        <div>
                            <h4 className="text-xl font-black text-white">Interactive Execution Architecture</h4>
                            <p className="text-xs text-[#B7CFC7] mt-1">
                                Full-screen interactive graph visualizing your workspace topology and pipeline dependencies.
                            </p>
                        </div>

                        <div className="py-12 bg-black/20 rounded-2xl border border-white/10 p-6 flex justify-center">
                            <svg viewBox="0 0 100 50" className="w-full max-w-3xl h-64">
                                <line x1="20" y1="25" x2="50" y2="15" stroke="#8FE3C4" strokeWidth="1.2" strokeDasharray="2,2" />
                                <line x1="20" y1="25" x2="50" y2="35" stroke="#8FE3C4" strokeWidth="1.2" strokeDasharray="2,2" />
                                <line x1="50" y1="15" x2="80" y2="25" stroke="#8FE3C4" strokeWidth="1.5" />
                                <line x1="50" y1="35" x2="80" y2="25" stroke="#8FE3C4" strokeWidth="1.5" />

                                <g
                                    transform="translate(20,25)"
                                    onClick={() => handleNodeClick("Workspaces Node", "Stores root access permissions and member roles")}
                                    className="cursor-pointer"
                                >
                                    <circle r="8" fill="#0F8A65" stroke="#8FE3C4" strokeWidth="2" />
                                    <text y="15" textAnchor="middle" fill="#8FE3C4" fontSize="4" fontWeight="bold">
                                        Workspaces ({stats?.workspacesCount || 0})
                                    </text>
                                </g>

                                <g
                                    transform="translate(50,15)"
                                    onClick={() => handleNodeClick("Projects Node", "Active agile boards and sprint containers")}
                                    className="cursor-pointer"
                                >
                                    <circle r="8" fill="#2563EB" stroke="#60A5FA" strokeWidth="2" />
                                    <text y="15" textAnchor="middle" fill="#60A5FA" fontSize="4" fontWeight="bold">
                                        Projects ({stats?.projectsCount || 0})
                                    </text>
                                </g>

                                <g
                                    transform="translate(50,35)"
                                    onClick={() => handleNodeClick("Execution Pipeline", "Active task processing and sprint review")}
                                    className="cursor-pointer"
                                >
                                    <circle r="8" fill="#D97706" stroke="#FBBF24" strokeWidth="2" />
                                    <text y="15" textAnchor="middle" fill="#FBBF24" fontSize="4" fontWeight="bold">
                                        Active Work ({stats?.tasks.inProgress || 0})
                                    </text>
                                </g>

                                <g
                                    transform="translate(80,25)"
                                    onClick={() => handleNodeClick("Delivered Tasks Node", "Completed milestones and verified tasks")}
                                    className="cursor-pointer"
                                >
                                    <circle r="9" fill="#0F8A65" stroke="#8FE3C4" strokeWidth="2.5" />
                                    <text y="16" textAnchor="middle" fill="#8FE3C4" fontSize="4.5" fontWeight="black">
                                        Delivered ({stats?.tasks.completed || 0})
                                    </text>
                                </g>
                            </svg>
                        </div>
                    </div>
                )}
            </main>

            {/* TASK DETAIL MODAL */}
            <Dialog open={!!selectedTaskForModal} onOpenChange={(open) => !open && setSelectedTaskForModal(null)}>
                <DialogContent className="max-w-md p-6 bg-white rounded-2xl border border-[#0F2D29]/15 space-y-4">
                    {selectedTaskForModal && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="rounded-md bg-[#0F8A65]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#0F8A65]">
                                        {selectedTaskForModal.project?.name || "Workspace Task"}
                                    </span>
                                    <span
                                        className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${selectedTaskForModal.status === "completed"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : selectedTaskForModal.status === "in_progress"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {selectedTaskForModal.status.replace("_", " ")}
                                    </span>
                                </div>
                                <DialogTitle className="text-lg font-black text-[#0F2D29]">
                                    {selectedTaskForModal.title}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-3 pt-2 text-xs">
                                <div className="p-3 rounded-xl bg-[#0F2D29]/2 space-y-1">
                                    <p className="font-bold text-[#5B6E68]">Due Date</p>
                                    <p className="font-bold text-[#0F2D29]">
                                        {selectedTaskForModal.dueDate
                                            ? new Date(selectedTaskForModal.dueDate).toLocaleString()
                                            : "No deadline specified"}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-[#0F2D29]/2 space-y-1">
                                    <p className="font-bold text-[#5B6E68]">Task Priority</p>
                                    <p className="font-bold text-[#0F2D29] uppercase">
                                        {selectedTaskForModal.priority || "Medium"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0F2D29]/10">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTaskForModal(null)}
                                    className="rounded-xl border border-[#0F2D29]/15 px-4 py-2 text-xs font-bold text-[#0F2D29] hover:bg-[#0F2D29]/5"
                                >
                                    Close
                                </button>
                                <Link
                                    to="/dashboard/tasks"
                                    className="rounded-xl bg-[#0F2D29] px-4 py-2 text-xs font-bold text-white hover:bg-[#0F2D29]/90"
                                >
                                    Open Full Task View
                                </Link>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* QUICK CREATE TASK MODAL */}
            <Dialog open={isCreateTaskModalOpen} onOpenChange={setIsCreateTaskModalOpen}>
                <DialogContent className="max-w-md p-6 bg-white rounded-2xl border border-[#0F2D29]/15">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <Plus size={20} className="text-[#0F8A65]" />
                            <DialogTitle className="text-lg font-black text-[#0F2D29]">
                                Quick Create Task
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-[#5B6E68]">
                            Add a new task directly to your current workspace and project.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateTaskSubmit} className="mt-4 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#0F2D29] mb-1">
                                Task Title *
                            </label>
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="e.g. Refactor API endpoints"
                                className="w-full rounded-xl border border-[#0F2D29]/15 px-3.5 py-2 text-xs font-semibold text-[#0F2D29] outline-none focus:border-[#0F8A65]"
                                required
                            />
                        </div>

                        {projectsList.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-[#0F2D29] mb-1">
                                    Project
                                </label>
                                <select
                                    value={newTaskProjectId}
                                    onChange={(e) => setNewTaskProjectId(e.target.value)}
                                    className="w-full rounded-xl border border-[#0F2D29]/15 px-3 py-2 text-xs font-semibold text-[#0F2D29] outline-none"
                                >
                                    {projectsList.map((p: any) => (
                                        <option key={p._id || p.id} value={p._id || p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-[#0F2D29] mb-1">
                                Priority
                            </label>
                            <select
                                value={newTaskPriority}
                                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                                className="w-full rounded-xl border border-[#0F2D29]/15 px-3 py-2 text-xs font-semibold text-[#0F2D29] outline-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0F2D29]/10">
                            <button
                                type="button"
                                onClick={() => setIsCreateTaskModalOpen(false)}
                                className="rounded-xl border border-[#0F2D29]/15 px-4 py-2 text-xs font-bold text-[#0F2D29] hover:bg-[#0F2D29]/5"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreatingTask}
                                className="flex items-center gap-1.5 rounded-xl bg-[#0F8A65] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0F8A65]/90 disabled:opacity-50"
                            >
                                {isCreatingTask ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                Create Task
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
