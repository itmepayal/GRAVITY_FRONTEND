import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useGetWorkspaceIntegrations } from "@/hooks/queries/integration/use-get-workspace-integrations";
import { useCreateIntegration } from "@/hooks/mutations/integration/use-create-integration";
import { useToggleIntegrationStatus } from "@/hooks/mutations/integration/use-toggle-integration-status";
import { useDeleteIntegration } from "@/hooks/mutations/integration/use-delete-integration";
import type { IntegrationProvider, IIntegration } from "@/types/integration";
import {
    Building2,
    Layers,
    Plus,
    RefreshCw,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Zap,
    Globe,
    Code2,
    MessageSquare,
    Calendar as CalendarIcon,
    Palette,
    Radio,
    Link2,
    Loader2,
    Check,
    Sliders,
    Power,
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const PROVIDER_METADATA: Record<
    IntegrationProvider,
    { name: string; description: string; icon: any; category: string; badgeColor: string }
> = {
    github: {
        name: "GitHub",
        description: "Sync PRs, commits, and issue statuses directly to tasks",
        icon: Code2,
        category: "Version Control",
        badgeColor: "bg-gray-100 text-gray-800 border-gray-300",
    },
    slack: {
        name: "Slack",
        description: "Receive real-time notifications for task updates and comments",
        icon: MessageSquare,
        category: "Communication",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    jira: {
        name: "Jira Software",
        description: "Bi-directional issue sync and sprint tracking",
        icon: Zap,
        category: "Issue Tracking",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    google_calendar: {
        name: "Google Calendar",
        description: "Sync task deadlines and sprint milestones to calendar events",
        icon: CalendarIcon,
        category: "Productivity",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    figma: {
        name: "Figma",
        description: "Embed design files and track design feedback inside tasks",
        icon: Palette,
        category: "Design",
        badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
    },
    webhook: {
        name: "Custom Webhook",
        description: "Send HTTP event payloads to your server endpoint",
        icon: Radio,
        category: "Developer Tools",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    custom: {
        name: "Custom Integration",
        description: "Connect custom REST APIs or internal tools",
        icon: Globe,
        category: "Custom",
        badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
};

export const Integration: React.FC = () => {
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
    const [providerFilter, setProviderFilter] = useState<string>("all");

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

    // Query Integrations
    const {
        data: integrationsData,
        isLoading: isLoadingIntegrations,
        isRefetching,
        refetch,
    } = useGetWorkspaceIntegrations({
        workspaceId: selectedWorkspace || activeWorkspaceId,
        projectId: selectedProject !== "all" ? selectedProject : undefined,
        provider: providerFilter !== "all" ? (providerFilter as IntegrationProvider) : undefined,
    });

    const integrations = integrationsData?.data || [];

    // Mutations
    const { mutate: createIntegration, isPending: isConnecting } = useCreateIntegration();
    const { mutate: toggleStatus, isPending: isToggling } = useToggleIntegrationStatus();
    const { mutate: deleteIntegration, isPending: isDeleting } = useDeleteIntegration();

    // Modal State
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [selectedProviderToConnect, setSelectedProviderToConnect] = useState<IntegrationProvider>("github");
    const [formData, setFormData] = useState({
        name: "",
        repository: "",
        webhookUrl: "",
        channelId: "",
        apiKey: "",
        eventsEnabled: ["task.created", "task.updated"],
    });

    const openConnectModal = (provider: IntegrationProvider) => {
        setSelectedProviderToConnect(provider);
        const meta = PROVIDER_METADATA[provider];
        setFormData({
            name: `${meta.name} Connection`,
            repository: "",
            webhookUrl: "",
            channelId: "",
            apiKey: "",
            eventsEnabled: ["task.created", "task.updated"],
        });
        setIsConnectModalOpen(true);
    };

    const handleConnectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetWs = selectedWorkspace || activeWorkspaceId;
        if (!targetWs) {
            toast.error("Please select a workspace first.");
            return;
        }

        if (!formData.name.trim()) {
            toast.error("Integration name is required.");
            return;
        }

        createIntegration(
            {
                workspace: targetWs,
                project: selectedProject !== "all" ? selectedProject : null,
                provider: selectedProviderToConnect,
                name: formData.name,
                status: "active",
                config: {
                    repository: formData.repository,
                    webhookUrl: formData.webhookUrl,
                    channelId: formData.channelId,
                    apiKey: formData.apiKey,
                },
                eventsEnabled: formData.eventsEnabled,
            },
            {
                onSuccess: () => {
                    toast.success(`${formData.name} connected successfully!`);
                    setIsConnectModalOpen(false);
                },
                onError: (err: any) => {
                    toast.error(err?.message || "Failed to connect integration.");
                },
            }
        );
    };

    const handleToggleStatus = (integrationId: string) => {
        toggleStatus(integrationId, {
            onSuccess: (res) => {
                toast.success(res.message || "Integration status updated.");
            },
            onError: (err: any) => {
                toast.error(err?.message || "Failed to update status.");
            },
        });
    };

    const handleDeleteIntegration = (integrationId: string, name: string) => {
        if (!confirm(`Are you sure you want to disconnect "${name}"?`)) return;
        deleteIntegration(integrationId, {
            onSuccess: () => {
                toast.success("Integration disconnected successfully.");
            },
            onError: (err: any) => {
                toast.error(err?.message || "Failed to delete integration.");
            },
        });
    };

    // Calculate Banner Statistics
    const activeCount = integrations.filter((i) => i.status === "active").length;
    const errorCount = integrations.filter((i) => i.status === "error").length;

    const bannerCards = [
        {
            title: "Total Integrations",
            value: integrations.length,
            subtitle: "Configured tool integrations",
            icon: Link2,
            accentColor: "#0F8A65",
            bgGradient: "from-[#0F8A65]/10 to-transparent",
        },
        {
            title: "Active Syncs",
            value: activeCount,
            subtitle: "Live active connections",
            icon: CheckCircle2,
            accentColor: "#2563EB",
            bgGradient: "from-[#2563EB]/10 to-transparent",
        },
        {
            title: "Supported Apps",
            value: Object.keys(PROVIDER_METADATA).length,
            subtitle: "Turnkey integrations ready",
            icon: Globe,
            accentColor: "#7C3AED",
            bgGradient: "from-[#7C3AED]/10 to-transparent",
        },
        {
            title: "Connection Health",
            value: errorCount > 0 ? `${errorCount} Issues` : "Healthy",
            subtitle: errorCount > 0 ? "Requires attention" : "All integrations operational",
            icon: errorCount > 0 ? AlertCircle : CheckCircle2,
            accentColor: errorCount > 0 ? "#DC2626" : "#0F8A65",
            bgGradient: errorCount > 0 ? "from-[#DC2626]/10 to-transparent" : "from-[#0F8A65]/10 to-transparent",
        },
    ];

    return (
        <>
            <Topbar
                variant="light"
                title="Integrations & Apps Directory"
                subtitle="Connect GitHub, Slack, Jira, Webhooks and third-party developer tools to automate your workflows"
                onMenuClick={openMobileNav}
            />

            <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Metric Banner matched with Workspaces/Projects design */}
                <DashboardMetricsBanner cards={bannerCards} />

                {/* Filter Controls Bar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-[#0F2D29]/12 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Workspace Selector */}
                        <div className="flex items-center gap-2 rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-1.5 shadow-2xs">
                            <Building2 size={15} className="text-[#0F8A65]" />
                            <select
                                value={selectedWorkspace || activeWorkspaceId}
                                onChange={(e) => setSelectedWorkspace(e.target.value)}
                                disabled={isLoadingWorkspaces}
                                className="bg-transparent text-[13px] font-semibold text-[#0F2D29] outline-none cursor-pointer"
                            >
                                {workspaces.map((w: { id: string; name: string }) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Project Selector */}
                        <div className="flex items-center gap-2 rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-1.5 shadow-2xs">
                            <Layers size={15} className="text-[#2563EB]" />
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="bg-transparent text-[13px] font-semibold text-[#0F2D29] outline-none cursor-pointer"
                            >
                                <option value="all">All Projects</option>
                                {projects.map((p: { id: string; name: string }) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Provider Filter */}
                        <div className="flex items-center gap-2 rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-1.5 shadow-2xs">
                            <Sliders size={15} className="text-[#7C3AED]" />
                            <select
                                value={providerFilter}
                                onChange={(e) => setProviderFilter(e.target.value)}
                                className="bg-transparent text-[13px] font-semibold text-[#0F2D29] outline-none cursor-pointer"
                            >
                                <option value="all">All App Providers</option>
                                {Object.entries(PROVIDER_METADATA).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isRefetching || isLoadingIntegrations}
                            className="flex items-center gap-1.5 rounded-xl border border-[#0F2D29]/15 bg-white px-3.5 py-2 text-[12.5px] font-bold text-[#0F2D29] transition-colors hover:bg-[#0F2D29]/5 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />
                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={() => openConnectModal("webhook")}
                            className="flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#0F2D29]/90 shadow-2xs"
                        >
                            <Plus size={15} />
                            Add Custom Integration
                        </button>
                    </div>
                </div>

                {/* SECTION 1: TURNKEY APP DIRECTORY */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-black text-[#0F2D29]">App Directory & Ecosystem</h3>
                            <p className="text-xs text-[#5B6E68]">
                                Select any service below to quickly connect its API key or Webhook to your workspace.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(PROVIDER_METADATA).map(([key, provider]) => {
                            const ProviderIcon = provider.icon;
                            const existingConnections = integrations.filter((i) => i.provider === key);
                            const isConnected = existingConnections.length > 0;

                            return (
                                <div
                                    key={key}
                                    className="flex flex-col justify-between rounded-2xl border border-[#0F2D29]/12 bg-white p-5 shadow-xs transition-all hover:border-[#0F8A65]/40 hover:shadow-sm"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F2D29]/5 text-[#0F2D29]">
                                                <ProviderIcon size={22} />
                                            </div>
                                            <span
                                                className={`rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${provider.badgeColor}`}
                                            >
                                                {provider.category}
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-black text-[#0F2D29]">{provider.name}</h4>
                                            <p className="mt-1 text-xs text-[#5B6E68] leading-relaxed">
                                                {provider.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#0F2D29]/8">
                                        <div className="flex items-center gap-1.5 text-xs font-bold">
                                            {isConnected ? (
                                                <span className="flex items-center gap-1 text-[#0F8A65]">
                                                    <CheckCircle2 size={13} />
                                                    {existingConnections.length} Connected
                                                </span>
                                            ) : (
                                                <span className="text-[#5B6E68]/70">Not connected</span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => openConnectModal(key as IntegrationProvider)}
                                            className="flex items-center gap-1.5 rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29]/3 px-3 py-1.5 text-xs font-bold text-[#0F2D29] transition-colors hover:bg-[#0F2D29] hover:text-white"
                                        >
                                            <Plus size={13} />
                                            Connect
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SECTION 2: CONNECTED INTEGRATIONS LIST */}
                <div className="rounded-2xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0F2D29]/10 gap-3">
                        <div>
                            <h4 className="text-base font-black text-[#0F2D29]">
                                Connected Workspace Integrations ({integrations.length})
                            </h4>
                            <p className="text-xs text-[#5B6E68] mt-0.5">
                                Active webhook subscriptions and external tool connections configured in this workspace.
                            </p>
                        </div>
                    </div>

                    {isLoadingIntegrations ? (
                        <div className="flex min-h-48 items-center justify-center">
                            <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
                        </div>
                    ) : integrations.length === 0 ? (
                        <div className="py-12 text-center">
                            <Link2 size={28} className="mx-auto text-[#5B6E68]/40 mb-2" />
                            <p className="text-sm font-bold text-[#0F2D29]">No Integrations Connected</p>
                            <p className="text-xs text-[#5B6E68] mt-1">
                                Click "Connect" on any application above to enable automated notifications or sync.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#0F2D29]/8">
                            {integrations.map((item: IIntegration) => {
                                const meta = PROVIDER_METADATA[item.provider] || PROVIDER_METADATA["custom"];
                                const IconComponent = meta.icon;
                                const createdUser = typeof item.createdBy === "object" ? item.createdBy : null;

                                return (
                                    <div
                                        key={item._id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4 px-3 rounded-xl transition-colors hover:bg-[#0F2D29]/2"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F2D29]/5 text-[#0F2D29] mt-0.5">
                                                <IconComponent size={20} />
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-[#0F2D29]">
                                                        {item.name}
                                                    </span>
                                                    <span
                                                        className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${item.status === "active"
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : item.status === "error"
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-gray-100 text-gray-700"
                                                            }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-[#5B6E68]">
                                                    {item.config.repository ? `Repo: ${item.config.repository} · ` : ""}
                                                    {item.config.webhookUrl ? `Endpoint: ${item.config.webhookUrl} · ` : ""}
                                                    Events: {item.eventsEnabled?.join(", ") || "All Events"}
                                                </p>

                                                {createdUser && (
                                                    <p className="text-[11px] text-[#5B6E68]/80">
                                                        Added by {createdUser.name} · Last synced:{" "}
                                                        {item.lastSyncedAt
                                                            ? new Date(item.lastSyncedAt).toLocaleString()
                                                            : "Never"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2.5 self-end sm:self-auto">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(item._id)}
                                                disabled={isToggling}
                                                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${item.status === "active"
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                    : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <Power size={13} />
                                                {item.status === "active" ? "Enabled" : "Disabled"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteIntegration(item._id, item.name)}
                                                disabled={isDeleting}
                                                className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                                                title="Disconnect integration"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* CONNECT INTEGRATION MODAL */}
            <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
                <DialogContent className="max-w-lg p-6 bg-white rounded-2xl border border-[#0F2D29]/15">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F2D29]/5 text-[#0F2D29]">
                                {React.createElement(PROVIDER_METADATA[selectedProviderToConnect].icon, { size: 18 })}
                            </div>
                            <DialogTitle className="text-lg font-black text-[#0F2D29]">
                                Connect {PROVIDER_METADATA[selectedProviderToConnect].name}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-[#5B6E68]">
                            Configure API credentials and trigger webhook settings for this workspace.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleConnectSubmit} className="mt-4 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#0F2D29] mb-1">
                                Integration Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Production GitHub Sync"
                                className="w-full rounded-xl border border-[#0F2D29]/15 px-3.5 py-2 text-xs font-semibold text-[#0F2D29] outline-none focus:border-[#0F8A65]"
                                required
                            />
                        </div>

                        {selectedProviderToConnect === "github" && (
                            <div>
                                <label className="block text-xs font-bold text-[#0F2D29] mb-1">
                                    GitHub Repository (org/repo)
                                </label>
                                <input
                                    type="text"
                                    value={formData.repository}
                                    onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                                    placeholder="e.g. acme/task-management"
                                    className="w-full rounded-xl border border-[#0F2D29]/15 px-3.5 py-2 text-xs font-semibold text-[#0F2D29] outline-none focus:border-[#0F8A65]"
                                />
                            </div>
                        )}

                        {(selectedProviderToConnect === "webhook" || selectedProviderToConnect === "slack") && (
                            <div>
                                <label className="block text-xs font-bold text-[#0F2D29] mb-1">
                                    Webhook URL Endpoint
                                </label>
                                <input
                                    type="url"
                                    value={formData.webhookUrl}
                                    onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                                    placeholder="https://hooks.slack.com/services/..."
                                    className="w-full rounded-xl border border-[#0F2D29]/15 px-3.5 py-2 text-xs font-semibold text-[#0F2D29] outline-none focus:border-[#0F8A65]"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-[#0F2D29] mb-1">
                                API Key / Secret Token (Optional)
                            </label>
                            <input
                                type="password"
                                value={formData.apiKey}
                                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                placeholder="ghp_xxxxxxxxxxxx or API Secret"
                                className="w-full rounded-xl border border-[#0F2D29]/15 px-3.5 py-2 text-xs font-semibold text-[#0F2D29] outline-none focus:border-[#0F8A65]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0F2D29] mb-1.5">
                                Subscribed Workspace Triggers
                            </label>
                            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#0F2D29]">
                                {["task.created", "task.updated", "sprint.started", "comment.added"].map((evt) => {
                                    const isChecked = formData.eventsEnabled.includes(evt);
                                    return (
                                        <label
                                            key={evt}
                                            className={`flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer transition-colors ${isChecked
                                                ? "border-[#0F8A65] bg-[#0F8A65]/5 font-bold"
                                                : "border-[#0F2D29]/10 bg-white"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            eventsEnabled: [...formData.eventsEnabled, evt],
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            eventsEnabled: formData.eventsEnabled.filter((x) => x !== evt),
                                                        });
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                            <div
                                                className={`flex h-4 w-4 items-center justify-center rounded-md border ${isChecked
                                                    ? "border-[#0F8A65] bg-[#0F8A65] text-white"
                                                    : "border-gray-300"
                                                    }`}
                                            >
                                                {isChecked && <Check size={11} />}
                                            </div>
                                            <span>{evt}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0F2D29]/10">
                            <button
                                type="button"
                                onClick={() => setIsConnectModalOpen(false)}
                                className="rounded-xl border border-[#0F2D29]/15 px-4 py-2 text-xs font-bold text-[#0F2D29] hover:bg-[#0F2D29]/5"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isConnecting}
                                className="flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0F2D29]/90 disabled:opacity-50"
                            >
                                {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Save & Connect
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Integration;