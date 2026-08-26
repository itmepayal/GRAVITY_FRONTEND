import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useSyncedWorkspace } from "@/hooks/useSyncedWorkspace";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useGetProjectTasks } from "@/hooks/queries/task/use-get-project-tasks";

import { useGetWorkspaceFiles } from "@/hooks/queries/file/use-get-workspace-files";
import { useGetWorkspaceFolders } from "@/hooks/queries/file/use-get-workspace-folders";
import { useUploadFile } from "@/hooks/mutations/file/use-upload-file";
import { useCreateFolder } from "@/hooks/mutations/file/use-create-folder";
import { useDeleteFile } from "@/hooks/mutations/file/use-delete-file";
import { useDeleteFolder } from "@/hooks/mutations/file/use-delete-folder";

import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import {
    FONT_POPPINS,
    COMMON_CLASSES,
} from "@/components/common/design-system";
import { toast } from "sonner";

import {
    FolderOpen,
    FileText,
    UploadCloud,
    FolderPlus,
    Search,
    Trash2,
    X,
    FileCode,
    Image as ImageIcon,
    FileArchive,
    HardDrive,
    Grid,
    List,
    AlertTriangle,
    ChevronRight,
    Folder,
    ExternalLink,
    User,
} from "lucide-react";
import type { IFile, IFolder } from "@/types/file";

export function Files() {
    const { openMobileNav } = useDashboardContext();

    const {
        workspaces,
        currentWorkspaceId: selectedWorkspaceId,
        setCurrentWorkspaceId: setSelectedWorkspaceId,
        isLoadingWorkspaces,
    } = useSyncedWorkspace();

    // 2. Fetch Workspace Projects
    const { data: projectsResponse } = useGetWorkspaceProjects(selectedWorkspaceId);
    const projects = projectsResponse?.data || [];

    // Active Folder Navigation (null = root)
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

    // Search & Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
    const [selectedEntityType] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // 3. Fetch Files & Folders
    const {
        data: filesResponse,
        isLoading: isLoadingFiles,
        refetch: refetchFiles,
    } = useGetWorkspaceFiles(selectedWorkspaceId, {
        project: selectedProjectId !== "all" ? selectedProjectId : undefined,
        folder: activeFolderId,
        entityType: selectedEntityType !== "all" ? selectedEntityType : undefined,
        search: searchQuery.trim() || undefined,
    });

    const {
        data: foldersResponse,
        refetch: refetchFolders,
    } = useGetWorkspaceFolders(selectedWorkspaceId, {
        project: selectedProjectId !== "all" ? selectedProjectId : undefined,
        parentFolder: activeFolderId,
    });

    const files = filesResponse?.data || [];
    const folders = foldersResponse?.data || [];

    // Mutations
    const { mutate: uploadFileMutate, isPending: isUploading } = useUploadFile();
    const { mutate: createFolderMutate, isPending: isCreatingFolder } =
        useCreateFolder();
    const { mutate: deleteFileMutate } = useDeleteFile();
    const { mutate: deleteFolderMutate } = useDeleteFolder();

    // Modals state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

    // Upload Form State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [targetProjectId, setTargetProjectId] = useState<string>("");
    const [targetTaskId, setTargetTaskId] = useState<string>("");
    const [targetFolderId, setTargetFolderId] = useState<string>("");
    const [description, setDescription] = useState("");
    const [tagsInput, setTagsInput] = useState("");

    // Create Folder Form State
    const [folderName, setFolderName] = useState("");
    const [folderColor] = useState("#6366F1");

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{
        id: string;
        type: "file" | "folder";
        name: string;
    } | null>(null);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

    // Fetch Tasks for upload modal when project changes
    const { data: tasksResponse } = useGetProjectTasks(targetProjectId);
    const tasks = (tasksResponse as any)?.data || [];

    const activeWorkspaceName =
        workspaces.find((w: any) => (w._id || w.id) === selectedWorkspaceId)
            ?.name ?? "Workspace";

    // Calculate Metrics
    const totalSizeBytes = useMemo(() => {
        return files.reduce((acc, f) => acc + (f.fileSize || 0), 0);
    }, [files]);

    const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

    const activeContributors = useMemo(() => {
        const userIds = new Set(
            files.map((f: any) => f.uploadedBy?._id || f.uploadedBy?.id || f.uploadedBy),
        );
        return userIds.size;
    }, [files]);

    const metricCards = [
        {
            title: "Total Files",
            value: files.length,
            subtitle: "Workspace document count",
            icon: FileText,
            accentColor: "#0F2D29",
            bgGradient: "from-[#0F2D29]/5 to-transparent",
        },
        {
            title: "Storage Used",
            value: `${totalSizeMB} MB`,
            subtitle: "Total Cloudinary storage",
            icon: HardDrive,
            accentColor: "#0F8A65",
            bgGradient: "from-[#0F8A65]/10 to-transparent",
        },
        {
            title: "Folders",
            value: folders.length,
            subtitle: "Active directory folders",
            icon: FolderOpen,
            accentColor: "#6366F1",
            bgGradient: "from-[#6366F1]/10 to-transparent",
        },
        {
            title: "Contributors",
            value: activeContributors,
            subtitle: "Team members uploading assets",
            icon: User,
            accentColor: "#D97706",
            bgGradient: "from-[#D97706]/10 to-transparent",
        },
    ];

    // Handlers
    const handleOpenUploadModal = () => {
        setSelectedFile(null);
        setTargetProjectId("");
        setTargetTaskId("");
        setTargetFolderId(activeFolderId || "");
        setDescription("");
        setTagsInput("");
        setIsUploadModalOpen(true);
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please select a file to upload.");
            return;
        }
        if (!selectedWorkspaceId) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        const metadata = {
            workspace: selectedWorkspaceId,
            project: targetProjectId || undefined,
            task: targetTaskId || undefined,
            folder: targetFolderId || undefined,
            entityType: targetTaskId
                ? "task"
                : targetProjectId
                    ? "project"
                    : "workspace",
            description: description.trim(),
            tags: tagsInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        };

        formData.append("data", JSON.stringify(metadata));

        uploadFileMutate(formData, {
            onSuccess: () => {
                setIsUploadModalOpen(false);
                refetchFiles();
            },
        });
    };

    const handleFolderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!folderName.trim()) return;
        if (!selectedWorkspaceId) return;

        createFolderMutate(
            {
                name: folderName.trim(),
                workspace: selectedWorkspaceId,
                project: selectedProjectId !== "all" ? selectedProjectId : undefined,
                parentFolder: activeFolderId,
                color: folderColor,
            },
            {
                onSuccess: () => {
                    setIsFolderModalOpen(false);
                    setFolderName("");
                    refetchFolders();
                },
            },
        );
    };

    const handleRequestDelete = (id: string, type: "file" | "folder", name: string) => {
        setItemToDelete({ id, type, name });
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

        if (itemToDelete.type === "file") {
            deleteFileMutate(itemToDelete.id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                    refetchFiles();
                },
            });
        } else {
            deleteFolderMutate(itemToDelete.id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                    refetchFolders();
                },
            });
        }
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const getFileIcon = (mimeType: string, ext: string) => {
        if (mimeType.startsWith("image/"))
            return <ImageIcon size={18} className="text-purple-600" />;
        if (ext === "pdf" || mimeType.includes("pdf"))
            return <FileText size={18} className="text-rose-600" />;
        if (["zip", "rar", "tar", "gz"].includes(ext))
            return <FileArchive size={18} className="text-amber-600" />;
        if (["js", "ts", "json", "html", "css"].includes(ext))
            return <FileCode size={18} className="text-emerald-600" />;
        return <FileText size={18} className="text-indigo-600" />;
    };

    return (
        <>
            <Topbar
                variant="light"
                title="Files & Assets Repository"
                subtitle={`${activeWorkspaceName} · Digital Assets Stream`}
                onMenuClick={openMobileNav}
            />

            <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
                <DashboardMetricsBanner cards={metricCards} />

                {/* Toolbar */}
                <div className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs space-y-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Workspace Select */}
                            <div className="min-w-47.5">
                                <label className={COMMON_CLASSES.labelUppercase}>
                                    Workspace
                                </label>
                                <select
                                    value={selectedWorkspaceId}
                                    onChange={(e) => {
                                        setSelectedWorkspaceId(e.target.value);
                                        setActiveFolderId(null);
                                    }}
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

                            {/* Project Select */}
                            <div className="min-w-47.5">
                                <label className={COMMON_CLASSES.labelUppercase}>
                                    Project Filter
                                </label>
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className={COMMON_CLASSES.selectBase + " w-full"}
                                >
                                    <option value="all">All Projects</option>
                                    {projects.map((p: any) => (
                                        <option key={p._id || p.id} value={p._id || p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Search input */}
                            <div className="min-w-64 flex-1">
                                <label className={COMMON_CLASSES.labelUppercase}>
                                    Search Asset Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search files..."
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

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center border border-[#0F2D29]/15 bg-white p-0.5">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-1.5 ${viewMode === "grid" ? "bg-[#0F2D29] text-white" : "text-[#5B6E68]"}`}
                                >
                                    <Grid size={14} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-1.5 ${viewMode === "list" ? "bg-[#0F2D29] text-white" : "text-[#5B6E68]"}`}
                                >
                                    <List size={14} />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsFolderModalOpen(true)}
                                className={COMMON_CLASSES.btnSecondary}
                            >
                                <FolderPlus size={15} />
                                New Folder
                            </button>

                            <button
                                onClick={handleOpenUploadModal}
                                className={COMMON_CLASSES.btnPrimary}
                            >
                                <UploadCloud size={15} />
                                Upload File
                            </button>
                        </div>
                    </div>
                </div>

                {/* Directory Breadcrumb */}
                {activeFolderId && (
                    <div className="flex items-center gap-2 text-xs text-[#5B6E68] bg-white border border-[#0F2D29]/15 p-3">
                        <button
                            onClick={() => setActiveFolderId(null)}
                            className="hover:text-[#0F2D29] font-bold flex items-center gap-1"
                        >
                            <FolderOpen size={14} className="text-[#0F8A65]" />
                            Root Directory
                        </button>
                        <ChevronRight size={14} />
                        <span className="font-bold text-[#0F2D29]">Active Folder</span>
                    </div>
                )}

                {/* Folders Section */}
                {folders.length > 0 && (
                    <div className="space-y-3">
                        <h4 className={`${COMMON_CLASSES.headingTitle} text-sm flex items-center gap-2`}>
                            <Folder size={16} className="text-amber-500" />
                            Folders ({folders.length})
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {folders.map((f: IFolder) => (
                                <div
                                    key={f._id || f.id}
                                    onClick={() => setActiveFolderId(f._id || f.id!)}
                                    className="border border-[#0F2D29]/15 bg-white p-3.5 shadow-2xs hover:border-[#0F8A65] transition cursor-pointer flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Folder
                                            size={20}
                                            style={{ color: f.color || "#6366F1" }}
                                            className="shrink-0"
                                        />
                                        <span className={`${FONT_POPPINS} text-xs font-semibold text-[#0F2D29] truncate`}>
                                            {f.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRequestDelete(f._id || f.id!, "folder", f.name);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-rose-600 hover:bg-rose-50 p-1 transition"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Files Grid / List View */}
                <div className="space-y-3">
                    <h4 className={`${COMMON_CLASSES.headingTitle} text-sm flex items-center gap-2`}>
                        <FileText size={16} className="text-[#0F8A65]" />
                        Files & Documents ({files.length})
                    </h4>

                    {isLoadingFiles ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-32 w-full animate-pulse border border-[#0F2D29]/10 bg-gray-50/60 p-4"
                                />
                            ))}
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white border border-[#0F2D29]/15 text-center">
                            <FolderOpen size={40} className="text-[#8FA69E] mb-3" />
                            <h4 className={`${COMMON_CLASSES.headingTitle} text-base`}>
                                No files in this directory
                            </h4>
                            <p className={`${COMMON_CLASSES.headingSubtitle} mt-1 max-w-md`}>
                                Upload documents, design assets, or attachments to manage them here.
                            </p>
                            <button
                                onClick={handleOpenUploadModal}
                                className={`${COMMON_CLASSES.btnPrimary} mt-5`}
                            >
                                <UploadCloud size={15} />
                                Upload First File
                            </button>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {files.map((file: IFile) => (
                                <div
                                    key={file._id || file.id}
                                    className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs hover:border-[#0F8A65]/40 transition flex flex-col justify-between space-y-3 group"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {getFileIcon(file.fileType, file.extension)}
                                            <div className="min-w-0">
                                                <h5 className={`${FONT_POPPINS} text-xs font-bold text-[#0F2D29] truncate`}>
                                                    {file.name}
                                                </h5>
                                                <span className={`${FONT_POPPINS} text-[10px] text-[#5B6E68]`}>
                                                    {formatFileSize(file.fileSize)} · {file.extension.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRequestDelete(file._id || file.id!, "file", file.name)}
                                            className="text-rose-600 hover:bg-rose-50 p-1 opacity-0 group-hover:opacity-100 transition"
                                            title="Delete File"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>

                                    {file.description && (
                                        <p className={`${FONT_POPPINS} text-[11px] text-[#5B6E68] line-clamp-2`}>
                                            {file.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between border-t border-[#0F2D29]/10 pt-2.5 text-[10px] text-[#5B6E68]">
                                        <span className="truncate">
                                            By {file.uploadedBy?.name || "Member"}
                                        </span>
                                        <a
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#0F8A65] hover:underline font-bold flex items-center gap-1"
                                        >
                                            Open <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border border-[#0F2D29]/15 bg-white divide-y divide-[#0F2D29]/10">
                            {files.map((file: IFile) => (
                                <div
                                    key={file._id || file.id}
                                    className="p-3 hover:bg-gray-50 flex items-center justify-between gap-4 text-xs"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {getFileIcon(file.fileType, file.extension)}
                                        <div className="min-w-0 flex-1">
                                            <h5 className={`${FONT_POPPINS} font-bold text-[#0F2D29] truncate`}>
                                                {file.name}
                                            </h5>
                                            <span className="text-[10px] text-[#5B6E68]">
                                                Uploaded by {file.uploadedBy?.name || "User"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 shrink-0 text-[#5B6E68]">
                                        <span>{formatFileSize(file.fileSize)}</span>
                                        <a
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#0F8A65] hover:underline font-bold flex items-center gap-1"
                                        >
                                            View <ExternalLink size={11} />
                                        </a>
                                        <button
                                            onClick={() => handleRequestDelete(file._id || file.id!, "file", file.name)}
                                            className="text-rose-600 hover:bg-rose-50 p-1 transition"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Upload File Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
                    <div className={COMMON_CLASSES.modalShell}>
                        <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
                            <h3 className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}>
                                <UploadCloud className="text-[#0F8A65]" size={18} />
                                Upload Asset File
                            </h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="p-4 space-y-4">
                            <div>
                                <label className={COMMON_CLASSES.labelUppercase}>Select File *</label>
                                <input
                                    type="file"
                                    required
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className={COMMON_CLASSES.inputBase}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={COMMON_CLASSES.labelUppercase}>Project (Optional)</label>
                                    <select
                                        value={targetProjectId}
                                        onChange={(e) => setTargetProjectId(e.target.value)}
                                        className={COMMON_CLASSES.selectBase + " w-full"}
                                    >
                                        <option value="">None / Workspace Root</option>
                                        {projects.map((p: any) => (
                                            <option key={p._id || p.id} value={p._id || p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={COMMON_CLASSES.labelUppercase}>Task (Optional)</label>
                                    <select
                                        value={targetTaskId}
                                        onChange={(e) => setTargetTaskId(e.target.value)}
                                        disabled={!targetProjectId}
                                        className={COMMON_CLASSES.selectBase + " w-full"}
                                    >
                                        <option value="">None</option>
                                        {tasks.map((t: any) => (
                                            <option key={t._id || t.id} value={t._id || t.id}>
                                                {t.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={COMMON_CLASSES.labelUppercase}>Description</label>
                                <textarea
                                    rows={2}
                                    placeholder="Optional description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={COMMON_CLASSES.inputBase}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className={COMMON_CLASSES.btnSecondary}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading || !selectedFile}
                                    className={COMMON_CLASSES.btnPrimary}
                                >
                                    {isUploading ? "Uploading..." : "Upload File"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Folder Modal */}
            {isFolderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
                    <div className={COMMON_CLASSES.modalShell}>
                        <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
                            <h3 className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}>
                                <FolderPlus className="text-[#6366F1]" size={18} />
                                Create New Folder
                            </h3>
                            <button onClick={() => setIsFolderModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleFolderSubmit} className="p-4 space-y-4">
                            <div>
                                <label className={COMMON_CLASSES.labelUppercase}>Folder Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Design Assets"
                                    value={folderName}
                                    onChange={(e) => setFolderName(e.target.value)}
                                    className={COMMON_CLASSES.inputBase}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFolderModalOpen(false)}
                                    className={COMMON_CLASSES.btnSecondary}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingFolder || !folderName.trim()}
                                    className={COMMON_CLASSES.btnPrimary}
                                >
                                    {isCreatingFolder ? "Creating..." : "Create Folder"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
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
                                To delete <span className="font-bold text-[#0F2D29]">{itemToDelete?.name}</span>, please type <span className="font-bold text-rose-600">DELETE</span> below.
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

export default Files;
