import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth.store";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";

import { useGetWorkspaceInbox } from "@/hooks/queries/inbox/use-get-workspace-inbox";
import { useCreateInboxItem } from "@/hooks/mutations/inbox/use-create-inbox-item";
import { useToggleStarInboxItem } from "@/hooks/mutations/inbox/use-toggle-star-inbox-item";
import { useUpdateInboxStatus } from "@/hooks/mutations/inbox/use-update-inbox-status";
import { useMarkAllInboxRead } from "@/hooks/mutations/inbox/use-mark-all-inbox-read";
import { useDeleteInboxItem } from "@/hooks/mutations/inbox/use-delete-inbox-item";

import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import {
    FONT_GOLDMAN,
    FONT_POPPINS,
    COMMON_CLASSES,
} from "@/components/common/design-system";
import { toast } from "sonner";

import {
    Inbox as InboxIcon,
    Mail,
    Star,
    Trash2,
    X,
    Search,
    Plus,
    AlertTriangle,
    AtSign,
    CheckCheck,
    Calendar,
    Tag,
} from "lucide-react";
import type { IInboxItem, InboxItemType, InboxItemStatus } from "@/types/inbox";

export function Inbox() {
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

    // 2. Fetch All Users for recipient selection
    const { data: usersResponse, isLoading: isLoadingUsers } = useGetAllUsers();
    const allUsers = usersResponse || [];

    // Filters & State
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string>("all");

    // 3. Fetch Inbox Stream
    const {
        data: inboxResponse,
        isLoading: isLoadingInbox,
        refetch,
    } = useGetWorkspaceInbox({
        workspaceId: selectedWorkspaceId || undefined,
        status: activeTab === "unread" ? "unread" : undefined,
        isStarred: activeTab === "starred" ? true : undefined,
        type:
            activeTab !== "all" && activeTab !== "unread" && activeTab !== "starred"
                ? activeTab
                : undefined,
        search: searchQuery.trim() || undefined,
    });

    const inboxData = inboxResponse?.data;
    const items = inboxData?.items || [];
    const unreadCount = inboxData?.unreadCount || 0;

    // Mutations
    const { mutate: createInboxMutate, isPending: isSending } = useCreateInboxItem();
    const { mutate: toggleStarMutate } = useToggleStarInboxItem();
    const { mutate: updateStatusMutate } = useUpdateInboxStatus();
    const { mutate: markAllReadMutate, isPending: isMarkingAll } = useMarkAllInboxRead();
    const { mutate: deleteInboxMutate } = useDeleteInboxItem();

    // Modals
    const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
    const [recipientId, setRecipientId] = useState("");
    const [messageType, setMessageType] = useState<InboxItemType>("direct_message");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    // Delete Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<IInboxItem | null>(null);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

    const activeWorkspace = workspaces.find(
        (w: any) => (w._id || w.id) === selectedWorkspaceId,
    );
    const activeWorkspaceName = activeWorkspace?.name ?? "Workspace";

    // Metrics
    const starredCount = useMemo(() => items.filter((i) => i.isStarred).length, [items]);
    const mentionCount = useMemo(() => items.filter((i) => i.type === "mention" || i.type === "assignment").length, [items]);

    const metricCards = [
        {
            title: "Total Inbox Stream",
            value: items.length,
            subtitle: "Messages & Activity thread",
            icon: InboxIcon,
            accentColor: "#0F2D29",
            bgGradient: "from-[#0F2D29]/5 to-transparent",
        },
        {
            title: "Unread Messages",
            value: unreadCount,
            subtitle: "Requires your review",
            icon: Mail,
            accentColor: "#0F8A65",
            bgGradient: "from-[#0F8A65]/10 to-transparent",
        },
        {
            title: "Starred Items",
            value: starredCount,
            subtitle: "Flagged for follow-up",
            icon: Star,
            accentColor: "#D97706",
            bgGradient: "from-[#D97706]/10 to-transparent",
        },
        {
            title: "Mentions & Assigns",
            value: mentionCount,
            subtitle: "Direct team calls",
            icon: AtSign,
            accentColor: "#6366F1",
            bgGradient: "from-[#6366F1]/10 to-transparent",
        },
    ];

    // Handlers
    const handleToggleStar = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        toggleStarMutate(id, { onSuccess: () => refetch() });
    };

    const handleToggleReadStatus = (e: React.MouseEvent, item: IInboxItem) => {
        e.stopPropagation();
        const newStatus: InboxItemStatus = item.status === "unread" ? "read" : "unread";
        updateStatusMutate(
            { inboxId: item._id || item.id!, status: newStatus },
            { onSuccess: () => refetch() },
        );
    };

    const handleMarkAllAsRead = () => {
        markAllReadMutate(selectedWorkspaceId || undefined, {
            onSuccess: () => refetch(),
        });
    };

    const handleComposeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !body.trim()) {
            toast.error("Please enter subject and message body.");
            return;
        }
        if (!selectedWorkspaceId) return;

        let targetUserId = recipientId.trim();

        if (!targetUserId) {
            const owner = activeWorkspace?.owner;
            if (typeof owner === "object" && owner !== null) {
                targetUserId = owner._id || owner.id || "";
            } else if (typeof owner === "string") {
                targetUserId = owner;
            }
        }

        if (!targetUserId && authUser) {
            targetUserId = authUser.id || "";
        }

        if (!targetUserId) {
            toast.error("Please select a recipient user.");
            return;
        }

        createInboxMutate(
            {
                user: targetUserId,
                workspace: selectedWorkspaceId,
                type: messageType,
                subject: subject.trim(),
                body: body.trim(),
            },
            {
                onSuccess: () => {
                    setIsComposeModalOpen(false);
                    setRecipientId("");
                    setSubject("");
                    setBody("");
                    refetch();
                },
            },
        );
    };

    const handleRequestDelete = (e: React.MouseEvent, item: IInboxItem) => {
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

        deleteInboxMutate(itemToDelete._id || itemToDelete.id!, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
                refetch();
            },
        });
    };

    const getTypeBadge = (type: InboxItemType) => {
        switch (type) {
            case "mention":
                return "bg-purple-50 text-purple-800 border-purple-200";
            case "assignment":
                return "bg-blue-50 text-blue-800 border-blue-200";
            case "comment":
                return "bg-emerald-50 text-emerald-800 border-emerald-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-300";
        }
    };

    return (
        <>
            <Topbar
                variant="light"
                title="Inbox & Communication"
                subtitle={`${activeWorkspaceName} · Direct Mentions & Team Activity`}
                onMenuClick={openMobileNav}
            />

            <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
                <DashboardMetricsBanner cards={metricCards} />

                {/* Toolbar */}
                <div className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs space-y-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Left Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Workspace Select */}
                            <div className="min-w-47.5">
                                <label className={COMMON_CLASSES.labelUppercase}>
                                    Workspace
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

                            {/* Search */}
                            <div className="min-w-56 flex-1">
                                <label className={COMMON_CLASSES.labelUppercase}>
                                    Search Messages
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search inbox..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`${COMMON_CLASSES.inputBase} pl-9 py-2 text-xs`}
                                    />
                                    <Search
                                        size={14}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
                                    />
                                </div>
                            </div>
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
                                onClick={() => setIsComposeModalOpen(true)}
                                className={COMMON_CLASSES.btnPrimary}
                            >
                                <Plus size={15} />
                                Send Message
                            </button>
                        </div>
                    </div>

                    {/* Navigation Filter Tabs */}
                    <div className="flex items-center gap-2 border-t border-[#0F2D29]/10 pt-3 overflow-x-auto">
                        {[
                            { id: "all", label: "All Messages" },
                            { id: "unread", label: `Unread (${unreadCount})` },
                            { id: "starred", label: "Starred" },
                            { id: "mention", label: "Mentions" },
                            { id: "assignment", label: "Assignments" },
                            { id: "direct_message", label: "Direct Messages" },
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

                {/* Inbox Items Feed */}
                <div className="space-y-3">
                    <h4 className={`${COMMON_CLASSES.headingTitle} text-sm flex items-center gap-2`}>
                        <Mail size={16} className="text-[#0F8A65]" />
                        Inbox Activity Stream ({items.length})
                    </h4>

                    {isLoadingInbox ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-20 w-full animate-pulse border border-[#0F2D29]/10 bg-gray-50/60 p-4"
                                />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white border border-[#0F2D29]/15 text-center">
                            <InboxIcon size={40} className="text-[#8FA69E] mb-3" />
                            <h4 className={`${COMMON_CLASSES.headingTitle} text-base`}>
                                Your inbox is clean
                            </h4>
                            <p className={`${COMMON_CLASSES.headingSubtitle} mt-1 max-w-md`}>
                                No messages or team mentions found for this view filter.
                            </p>
                        </div>
                    ) : (
                        <div className="border border-[#0F2D29]/15 bg-white divide-y divide-[#0F2D29]/10 shadow-2xs">
                            {items.map((item: IInboxItem) => {
                                const dateStr = new Date(item.createdAt).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });

                                const isUnread = item.status === "unread";

                                return (
                                    <div
                                        key={item._id || item.id}
                                        className={`p-4 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 group ${isUnread ? "bg-emerald-50/20 font-medium" : "hover:bg-gray-50/80"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                            {/* Star Button */}
                                            <button
                                                onClick={(e) => handleToggleStar(e, item._id || item.id!)}
                                                className="mt-0.5 text-gray-300 hover:text-amber-500 transition"
                                            >
                                                <Star
                                                    size={16}
                                                    className={item.isStarred ? "fill-amber-400 text-amber-500" : ""}
                                                />
                                            </button>

                                            {/* Avatar / Sender */}
                                            <div className="w-8 h-8 rounded-full bg-[#0F2D29] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                {item.sender?.name ? item.sender.name.charAt(0).toUpperCase() : "S"}
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`${FONT_POPPINS} text-xs font-bold text-[#0F2D29]`}>
                                                        {item.sender?.name || "System Notification"}
                                                    </span>

                                                    <span
                                                        className={`${FONT_GOLDMAN} px-2 py-0.2 text-[9px] font-bold border uppercase ${getTypeBadge(item.type)}`}
                                                    >
                                                        {item.type.replace("_", " ")}
                                                    </span>

                                                    {isUnread && (
                                                        <span className="w-2 h-2 rounded-full bg-[#0F8A65]" />
                                                    )}
                                                </div>

                                                <h5 className={`${FONT_POPPINS} text-xs font-bold text-[#0F2D29]`}>
                                                    {item.subject}
                                                </h5>

                                                <p className={`${FONT_POPPINS} text-xs text-[#5B6E68] line-clamp-2`}>
                                                    {item.body}
                                                </p>

                                                {/* Metadata Tag links */}
                                                {item.task && typeof item.task === "object" && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] text-[#0F8A65] font-semibold mt-1">
                                                        <Tag size={11} /> Task: {item.task.title}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Info & Actions */}
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                                            <span className="text-[10px] text-[#8FA69E] flex items-center gap-1">
                                                <Calendar size={11} /> {dateStr}
                                            </span>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                                <button
                                                    onClick={(e) => handleToggleReadStatus(e, item)}
                                                    className="text-xs text-[#0F2D29] hover:bg-gray-100 px-2 py-1 border border-gray-200"
                                                >
                                                    {isUnread ? "Mark Read" : "Mark Unread"}
                                                </button>
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

            {/* Compose / Send Message Modal */}
            {isComposeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
                    <div className={`${COMMON_CLASSES.modalShell} max-w-lg w-full`}>
                        <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
                            <h3 className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}>
                                <Mail className="text-[#0F8A65]" size={18} />
                                Send Direct Message / Mention
                            </h3>
                            <button onClick={() => setIsComposeModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleComposeSubmit} className="p-4 space-y-4">
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

                            <div>
                                <label className={COMMON_CLASSES.labelUppercase}>Message Type</label>
                                <select
                                    value={messageType}
                                    onChange={(e) => setMessageType(e.target.value as InboxItemType)}
                                    className={COMMON_CLASSES.selectBase + " w-full"}
                                >
                                    <option value="direct_message">Direct Message</option>
                                    <option value="mention">Mention</option>
                                    <option value="assignment">Assignment Call</option>
                                    <option value="update">Workspace Announcement</option>
                                </select>
                            </div>

                            <div>
                                <label className={COMMON_CLASSES.labelUppercase}>Subject *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Code Review Request for API Specs"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className={COMMON_CLASSES.inputBase}
                                />
                            </div>

                            <div>
                                <label className={COMMON_CLASSES.labelUppercase}>Message Body *</label>
                                <textarea
                                    rows={5}
                                    required
                                    placeholder="Write message details or instructions..."
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className={COMMON_CLASSES.inputBase}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsComposeModalOpen(false)}
                                    className={COMMON_CLASSES.btnSecondary}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className={COMMON_CLASSES.btnPrimary}
                                >
                                    {isSending ? "Sending..." : "Send Message"}
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
                                To delete <span className="font-bold text-[#0F2D29]">{itemToDelete.subject}</span>, please type <span className="font-bold text-rose-600">DELETE</span> below.
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

export default Inbox;
