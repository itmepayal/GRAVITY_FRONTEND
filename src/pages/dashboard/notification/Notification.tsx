import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth.store";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";

import { useGetWorkspaceNotifications } from "@/hooks/queries/notification/use-get-workspace-notifications";
import { useCreateNotification } from "@/hooks/mutations/notification/use-create-notification";
import { useMarkNotificationRead } from "@/hooks/mutations/notification/use-mark-notification-read";
import { useMarkAllNotificationsRead } from "@/hooks/mutations/notification/use-mark-all-notifications-read";
import { useDeleteNotification } from "@/hooks/mutations/notification/use-delete-notification";

import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import {
    FONT_GOLDMAN,
    FONT_POPPINS,
    COMMON_CLASSES,
} from "@/components/common/design-system";
import { toast } from "sonner";

import {
    Bell,
    CheckCheck,
    Plus,
    Trash2,
    X,
    AlertTriangle,
    Calendar,
    ShieldAlert,
    ListChecks,
    Info,
    CheckCircle2,
} from "lucide-react";
import type {
    INotification,
    NotificationType,
    NotificationPriority,
} from "@/types/notification";

export function Notification() {
    const { openMobileNav } = useDashboardContext();
    const { user: authUser } = useAuthStore();

    // 1. Fetch Workspaces
    const { data: workspacesResponse, isLoading: isLoadingWorkspaces } =
        useGetUserWorkspaces();
    const workspaces = workspacesResponse?.data || [];

    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

    React.useEffect(() => {
        if (workspaces.length > 0 && !selectedWorkspaceId) {
            setSelectedWorkspaceId(workspaces[0]._id || workspaces[0].id);
        }
    }, [workspaces, selectedWorkspaceId]);

    // 2. Fetch Users
    const { data: usersResponse, isLoading: isLoadingUsers } = useGetAllUsers();
    const allUsers = usersResponse || [];

    // Filters
    const [activeTab, setActiveTab] = useState<string>("all");

    // 3. Fetch Notifications
    const {
        data: notificationsResponse,
        isLoading: isLoadingNotifications,
        refetch,
    } = useGetWorkspaceNotifications({
        workspaceId: selectedWorkspaceId || undefined,
        isRead: activeTab === "unread" ? false : undefined,
        type:
            activeTab !== "all" && activeTab !== "unread" && activeTab !== "urgent"
                ? activeTab
                : undefined,
    });

    const notificationsData = notificationsResponse?.data;
    const notifications = notificationsData?.notifications || [];
    const unreadCount = notificationsData?.unreadCount || 0;

    // Mutations
    const { mutate: createNotificationMutate, isPending: isCreating } =
        useCreateNotification();
    const { mutate: markReadMutate } = useMarkNotificationRead();
    const { mutate: markAllReadMutate, isPending: isMarkingAll } =
        useMarkAllNotificationsRead();
    const { mutate: deleteNotificationMutate } = useDeleteNotification();

    // Modals
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [recipientId, setRecipientId] = useState("");
    const [type, setType] = useState<NotificationType>("system");
    const [priority, setPriority] = useState<NotificationPriority>("medium");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    // Delete Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<INotification | null>(null);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

    const activeWorkspace = workspaces.find(
        (w: any) => (w._id || w.id) === selectedWorkspaceId,
    );
    const activeWorkspaceName = activeWorkspace?.name ?? "Workspace";

    // Metrics
    const urgentCount = useMemo(
        () => notifications.filter((n) => n.priority === "high" || n.priority === "urgent").length,
        [notifications],
    );
    const taskAlertsCount = useMemo(
        () => notifications.filter((n) => n.type.startsWith("task_")).length,
        [notifications],
    );

    const metricCards = [
        {
            title: "Total Alerts",
            value: notifications.length,
            subtitle: "Workspace notifications feed",
            icon: Bell,
            accentColor: "#0F2D29",
            bgGradient: "from-[#0F2D29]/5 to-transparent",
        },
        {
            title: "Unread Notifications",
            value: unreadCount,
            subtitle: "Actionable team updates",
            icon: ShieldAlert,
            accentColor: "#0F8A65",
            bgGradient: "from-[#0F8A65]/10 to-transparent",
        },
        {
            title: "Urgent & High",
            value: urgentCount,
            subtitle: "High priority alerts",
            icon: AlertTriangle,
            accentColor: "#DC2626",
            bgGradient: "from-[#DC2626]/10 to-transparent",
        },
        {
            title: "Task Updates",
            value: taskAlertsCount,
            subtitle: "Task status & assignments",
            icon: ListChecks,
            accentColor: "#6366F1",
            bgGradient: "from-[#6366F1]/10 to-transparent",
        },
    ];

    // Handlers
    const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        markReadMutate(id, { onSuccess: () => refetch() });
    };

    const handleMarkAllAsRead = () => {
        markAllReadMutate(selectedWorkspaceId || undefined, {
            onSuccess: () => refetch(),
        });
    };

    const handleSendNotification = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            toast.error("Please enter title and message text.");
            return;
        }

        let targetUserId = recipientId.trim();
        if (!targetUserId && authUser) {
            targetUserId = authUser.id || "";
        }

        if (!targetUserId) {
            toast.error("Please select a valid recipient.");
            return;
        }

        createNotificationMutate(
            {
                recipient: targetUserId,
                workspace: selectedWorkspaceId,
                type,
                priority,
                title: title.trim(),
                message: message.trim(),
            },
            {
                onSuccess: () => {
                    setIsSendModalOpen(false);
                    setRecipientId("");
                    setTitle("");
                    setMessage("");
                    refetch();
                },
            },
        );
    };

    const handleRequestDelete = (e: React.MouseEvent, item: INotification) => {
        e.stopPropagation();
        setItemToDelete(item);
        setDeleteConfirmInput("");
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemToDelete) return;

        if (deleteConfirmInput.trim().toUpperCase() !== "DELETE") {
            toast.error('Please type "DELETE" to confirm.');
            return;
        }

        deleteNotificationMutate(itemToDelete._id || itemToDelete.id!, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
                refetch();
            },
        });
    };

    const getPriorityBadge = (p: NotificationPriority) => {
        switch (p) {
            case "urgent":
                return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
            case "high":
                return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
            case "low":
                return "bg-gray-100 text-gray-700 border-gray-200";
            default:
                return "bg-emerald-50 text-emerald-800 border-emerald-200";
        }
    };

    return (
        <>
            <Topbar
                variant="light"
                title="Notifications & Alerts"
                subtitle={`${activeWorkspaceName} · Team Feed & System Alerts`}
                onMenuClick={openMobileNav}
            />

            <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
                <DashboardMetricsBanner cards={metricCards} />

                {/* Toolbar */}
                <div className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs space-y-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Workspace Select */}
                        <div className="min-w-56">
                            <label className={COMMON_CLASSES.labelUppercase}>
                                Workspace Context
                            </label>
                            <select
                                value={selectedWorkspaceId}
                                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                                disabled={isLoadingWorkspaces}
                                className={COMMON_CLASSES.selectBase + " w-full"}
                            >
                                {workspaces.map((w: any) => (
                                    <option key={w._id || w.id} value={w._id || w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={isMarkingAll || unreadCount === 0}
                                className={COMMON_CLASSES.btnSecondary}
                            >
                                <CheckCheck size={14} className="text-[#0F8A65]" />
                                Mark All Read
                            </button>

                            <button
                                onClick={() => setIsSendModalOpen(true)}
                                className={COMMON_CLASSES.btnPrimary}
                            >
                                <Plus size={15} />
                                Send Alert
                            </button>
                        </div>
                    </div>

                    {/* Navigation Filter Tabs */}
                    <div className="flex items-center gap-2 border-t border-[#0F2D29]/10 pt-3 overflow-x-auto">
                        {[
                            { id: "all", label: "All Alerts" },
                            { id: "unread", label: `Unread (${unreadCount})` },
                            { id: "task_assigned", label: "Task Assigned" },
                            { id: "task_updated", label: "Task Updates" },
                            { id: "comment_mention", label: "Comment Mentions" },
                            { id: "system", label: "System Alerts" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-1.5 text-xs font-bold transition border ${activeTab === tab.id
                                    ? "bg-[#0F2D29] text-white border-[#0F2D29]"
                                    : "bg-[#0F2D29]/5 text-[#5B6E68] border-transparent hover:bg-[#0F2D29]/10"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications Feed */}
                <div className="space-y-3">
                    <h4 className={`${COMMON_CLASSES.headingTitle} text-sm flex items-center gap-2`}>
                        <Bell size={16} className="text-[#0F8A65]" />
                        Notifications Stream ({notifications.length})
                    </h4>

                    {isLoadingNotifications ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-20 w-full animate-pulse border border-[#0F2D29]/10 bg-gray-50/60 p-4"
                                />
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white border border-[#0F2D29]/15 text-center">
                            <Bell size={40} className="text-[#8FA69E] mb-3" />
                            <h4 className={`${COMMON_CLASSES.headingTitle} text-base`}>
                                No notifications found
                            </h4>
                            <p className={`${COMMON_CLASSES.headingSubtitle} mt-1 max-w-md`}>
                                You are all caught up! No unread notifications for this workspace.
                            </p>
                        </div>
                    ) : (
                        <div className="border border-[#0F2D29]/15 bg-white divide-y divide-[#0F2D29]/10 shadow-2xs">
                            {notifications.map((item: INotification) => {
                                const dateStr = new Date(item.createdAt).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });

                                const isUnread = !item.isRead;

                                return (
                                    <div
                                        key={item._id || item.id}
                                        className={`p-4 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 group ${isUnread ? "bg-emerald-50/20 font-medium" : "hover:bg-gray-50/80"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                            {/* Priority Icon */}
                                            <div className="mt-0.5 shrink-0">
                                                {item.priority === "urgent" || item.priority === "high" ? (
                                                    <AlertTriangle size={16} className="text-rose-600" />
                                                ) : (
                                                    <Info size={16} className="text-[#0F8A65]" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h5 className={`${FONT_POPPINS} text-xs font-bold text-[#0F2D29]`}>
                                                        {item.title}
                                                    </h5>

                                                    <span
                                                        className={`${FONT_GOLDMAN} px-2 py-0.2 text-[9px] border uppercase ${getPriorityBadge(item.priority)}`}
                                                    >
                                                        {item.priority}
                                                    </span>

                                                    <span
                                                        className={`${FONT_GOLDMAN} px-2 py-0.2 text-[9px] font-bold border border-gray-200 uppercase bg-gray-100 text-gray-700`}
                                                    >
                                                        {item.type.replace("_", " ")}
                                                    </span>

                                                    {isUnread && (
                                                        <span className="w-2 h-2 rounded-full bg-[#0F8A65]" />
                                                    )}
                                                </div>

                                                <p className={`${FONT_POPPINS} text-xs text-[#5B6E68] line-clamp-2`}>
                                                    {item.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Date & Actions */}
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                                            <span className="text-[10px] text-[#8FA69E] flex items-center gap-1">
                                                <Calendar size={11} /> {dateStr}
                                            </span>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                                {isUnread && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(e, item._id || item.id!)}
                                                        className="text-xs text-[#0F8A65] hover:bg-emerald-50 px-2 py-1 border border-emerald-200 flex items-center gap-1 font-bold"
                                                    >
                                                        <CheckCircle2 size={12} /> Mark Read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleRequestDelete(e, item)}
                                                    className="text-rose-600 hover:bg-rose-50 p-1"
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
            </main>

            {/* Send Notification Alert Modal */}
            {isSendModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
                    <div className={`${COMMON_CLASSES.modalShell} max-w-lg w-full`}>
                        <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
                            <h3 className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}>
                                <Bell className="text-[#0F8A65]" size={18} />
                                Send Notification Alert
                            </h3>
                            <button onClick={() => setIsSendModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSendNotification} className="p-4 space-y-4">
                            <div>
                                <label className={COMMON_CLASSES.labelUppercase}>Select Recipient User *</label>
                                <select
                                    value={recipientId}
                                    onChange={(e) => setRecipientId(e.target.value)}
                                    disabled={isLoadingUsers}
                                    className={COMMON_CLASSES.selectBase + " w-full"}
                                >
                                    <option value="">-- Choose Recipient User --</option>
                                    {allUsers.map((u: any) => (
                                        <option key={u._id || u.id} value={u._id || u.id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={COMMON_CLASSES.labelUppercase}>Notification Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value as NotificationType)}
                                        className={COMMON_CLASSES.selectBase + " w-full"}
                                    >
                                        <option value="system">System Alert</option>
                                        <option value="task_assigned">Task Assigned</option>
                                        <option value="task_updated">Task Updated</option>
                                        <option value="comment_mention">Comment Mention</option>
                                        <option value="due_date_reminder">Due Date Reminder</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={COMMON_CLASSES.labelUppercase}>Priority Level</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                                        className={COMMON_CLASSES.selectBase + " w-full"}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={COMMON_CLASSES.labelUppercase}>Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Critical Bug Alert in Authentication"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={COMMON_CLASSES.inputBase}
                                />
                            </div>

                            <div>
                                <label className={COMMON_CLASSES.labelUppercase}>Message Body *</label>
                                <textarea
                                    rows={4}
                                    required
                                    placeholder="Enter notification details..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className={COMMON_CLASSES.inputBase}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsSendModalOpen(false)}
                                    className={COMMON_CLASSES.btnSecondary}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className={COMMON_CLASSES.btnPrimary}
                                >
                                    {isCreating ? "Sending..." : "Send Alert"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
                    <div className={`${COMMON_CLASSES.modalShell} max-w-md w-full`}>
                        <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
                            <h3 className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2 text-rose-600`}>
                                <AlertTriangle size={18} />
                                Confirm Deletion
                            </h3>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmDelete} className="p-4 space-y-4">
                            <p className={`${FONT_POPPINS} text-xs text-[#5B6E68]`}>
                                To delete <span className="font-bold text-[#0F2D29]">{itemToDelete.title}</span>, please type <span className="font-bold text-rose-600">DELETE</span> below.
                            </p>

                            <div>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder='Type "DELETE"'
                                    value={deleteConfirmInput}
                                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                                    className={`${COMMON_CLASSES.inputBase} border-rose-300 focus:border-rose-600`}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className={COMMON_CLASSES.btnSecondary}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={deleteConfirmInput.trim().toUpperCase() !== "DELETE"}
                                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Notification;
