import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";

import { useGetWorkspaceDocuments } from "@/hooks/queries/document/use-get-workspace-documents";
import { useCreateDocument } from "@/hooks/mutations/document/use-create-document";
import { useUpdateDocument } from "@/hooks/mutations/document/use-update-document";
import { useDeleteDocument } from "@/hooks/mutations/document/use-delete-document";

import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import {
  FONT_GOLDMAN,
  FONT_POPPINS,
  COMMON_CLASSES,
} from "@/components/common/design-system";
import { toast } from "sonner";

import {
  FileText,
  Plus,
  Search,
  Trash2,
  X,
  Edit2,
  BookOpen,
  FileCheck,
  FileClock,
  Archive,
  AlertTriangle,
  User,
  Calendar,
  Grid,
  List,
} from "lucide-react";
import type { IDocument, DocumentStatus } from "@/types/document";

export function Documents() {
  const { openMobileNav } = useDashboardContext();

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

  // 2. Fetch Workspace Projects
  const { data: projectsResponse } = useGetWorkspaceProjects(selectedWorkspaceId);
  const projects = projectsResponse?.data || [];

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 3. Fetch Documents
  const {
    data: docsResponse,
    isLoading: isLoadingDocs,
    refetch,
  } = useGetWorkspaceDocuments({
    workspace: selectedWorkspaceId,
    project: selectedProjectId !== "all" ? selectedProjectId : undefined,
    status: selectedStatus !== "all" ? (selectedStatus as DocumentStatus) : undefined,
    search: searchQuery.trim() || undefined,
  });

  const documents = docsResponse?.data?.documents || [];

  // Mutations
  const { mutate: createDocMutate, isPending: isCreating } = useCreateDocument();
  const { mutate: updateDocMutate, isPending: isUpdating } = useUpdateDocument();
  const { mutate: deleteDocMutate } = useDeleteDocument();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetProjectId, setTargetProjectId] = useState("");
  const [status, setStatus] = useState<DocumentStatus>("draft");
  const [tagsInput, setTagsInput] = useState("");

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<IDocument | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const activeWorkspaceName =
    workspaces.find((w: any) => (w._id || w.id) === selectedWorkspaceId)
      ?.name ?? "Workspace";

  // Metrics
  const publishedDocs = useMemo(() => documents.filter((d) => d.status === "published").length, [documents]);
  const draftDocs = useMemo(() => documents.filter((d) => d.status === "draft").length, [documents]);
  const archivedDocs = useMemo(() => documents.filter((d) => d.status === "archived").length, [documents]);

  const metricCards = [
    {
      title: "Total Documents",
      value: documents.length,
      subtitle: "Knowledge base docs",
      icon: BookOpen,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "Published Docs",
      value: publishedDocs,
      subtitle: "Live team documentation",
      icon: FileCheck,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Drafts",
      value: draftDocs,
      subtitle: "Work in progress docs",
      icon: FileClock,
      accentColor: "#D97706",
      bgGradient: "from-[#D97706]/10 to-transparent",
    },
    {
      title: "Archived",
      value: archivedDocs,
      subtitle: "Stored reference docs",
      icon: Archive,
      accentColor: "#6366F1",
      bgGradient: "from-[#6366F1]/10 to-transparent",
    },
  ];

  // Handlers
  const handleOpenCreateModal = () => {
    setTitle("");
    setContent("");
    setTargetProjectId("");
    setStatus("draft");
    setTagsInput("");
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId) return;

    createDocMutate(
      {
        title: title.trim() || "Untitled Document",
        content: content.trim(),
        workspace: selectedWorkspaceId,
        project: targetProjectId || undefined,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          refetch();
        },
      },
    );
  };

  const handleOpenEditModal = (doc: IDocument) => {
    setSelectedDoc(doc);
    setTitle(doc.title);
    setContent(doc.content);
    setStatus(doc.status);
    setTagsInput(doc.tags?.join(", ") || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    updateDocMutate(
      {
        id: selectedDoc._id || selectedDoc.id!,
        payload: {
          title: title.trim(),
          content: content.trim(),
          status,
          tags: tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedDoc(null);
          refetch();
        },
      },
    );
  };

  const handleRequestDelete = (doc: IDocument) => {
    setDocToDelete(doc);
    setDeleteConfirmInput("");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToDelete) return;

    if (deleteConfirmInput.trim().toUpperCase() !== "DELETE") {
      toast.error('Please type "DELETE" to confirm.');
      return;
    }

    deleteDocMutate(docToDelete._id || docToDelete.id!, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setDocToDelete(null);
        refetch();
      },
    });
  };

  const getStatusBadge = (st: DocumentStatus) => {
    switch (st) {
      case "published":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "archived":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  return (
    <>
      <Topbar
        variant="light"
        title="Knowledge Base & Documents"
        subtitle={`${activeWorkspaceName} · Team Specs & Wikis`}
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

              {/* Project Filter */}
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

              {/* Status Filter */}
              <div className="min-w-36">
                <label className={COMMON_CLASSES.labelUppercase}>Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={COMMON_CLASSES.selectBase + " w-full"}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Search */}
              <div className="min-w-56 flex-1">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Search Document Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search docs..."
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
                onClick={handleOpenCreateModal}
                className={COMMON_CLASSES.btnPrimary}
              >
                <Plus size={15} />
                Create Document
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid / List */}
        <div className="space-y-3">
          <h4 className={`${COMMON_CLASSES.headingTitle} text-sm flex items-center gap-2`}>
            <FileText size={16} className="text-[#0F8A65]" />
            Documents Stream ({documents.length})
          </h4>

          {isLoadingDocs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-36 w-full animate-pulse border border-[#0F2D29]/10 bg-gray-50/60 p-4"
                />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-[#0F2D29]/15 text-center">
              <BookOpen size={40} className="text-[#8FA69E] mb-3" />
              <h4 className={`${COMMON_CLASSES.headingTitle} text-base`}>
                No documents found
              </h4>
              <p className={`${COMMON_CLASSES.headingSubtitle} mt-1 max-w-md`}>
                Create project wiki pages, technical specifications, or team documentation.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className={`${COMMON_CLASSES.btnPrimary} mt-5`}
              >
                <Plus size={15} />
                Create First Document
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {documents.map((doc: IDocument) => {
                const dateStr = new Date(doc.updatedAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={doc._id || doc.id}
                    className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs hover:border-[#0F8A65]/40 transition flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`${FONT_GOLDMAN} px-2 py-0.5 text-[10px] font-bold border uppercase ${getStatusBadge(doc.status)}`}
                        >
                          {doc.status}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleOpenEditModal(doc)}
                            className="p-1 text-[#0F2D29] hover:bg-gray-100"
                            title="Edit Document"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleRequestDelete(doc)}
                            className="p-1 text-rose-600 hover:bg-rose-50"
                            title="Delete Document"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h5 className={`${FONT_POPPINS} text-sm font-bold text-[#0F2D29] line-clamp-1`}>
                        {doc.title}
                      </h5>

                      {doc.content && (
                        <p className={`${FONT_POPPINS} text-xs text-[#5B6E68] line-clamp-3`}>
                          {doc.content}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-[#0F2D29]/10 pt-2.5 text-[10px] text-[#5B6E68]">
                      <span className="flex items-center gap-1">
                        <User size={11} className="text-[#8FA69E]" />
                        {doc.createdBy?.name || "Member"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-[#0F8A65]" />
                        {dateStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-[#0F2D29]/15 bg-white divide-y divide-[#0F2D29]/10">
              {documents.map((doc: IDocument) => (
                <div
                  key={doc._id || doc.id}
                  className="p-3.5 hover:bg-gray-50 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText size={18} className="text-[#0F8A65] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className={`${FONT_POPPINS} font-bold text-[#0F2D29] truncate`}>
                          {doc.title}
                        </h5>
                        <span
                          className={`${FONT_GOLDMAN} px-2 py-0.2 text-[9px] font-bold border uppercase ${getStatusBadge(doc.status)}`}
                        >
                          {doc.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5B6E68]">
                        Created by {doc.createdBy?.name || "User"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(doc)}
                      className="p-1 text-[#0F2D29] hover:bg-gray-100"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleRequestDelete(doc)}
                      className="p-1 text-rose-600 hover:bg-rose-50"
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

      {/* Create Document Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
          <div className={`${COMMON_CLASSES.modalShell} max-w-lg w-full`}>
            <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
              <h3 className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}>
                <Plus className="text-[#0F8A65]" size={18} />
                Create New Document
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              <div>
                <label className={COMMON_CLASSES.labelUppercase}>Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architecture Overview & Specs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>Project (Optional)</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className={COMMON_CLASSES.selectBase + " w-full"}
                >
                  <option value="">None / Workspace Document</option>
                  {projects.map((p: any) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>Content Body</label>
                <textarea
                  rows={6}
                  placeholder="Write doc markdown or rich text content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={COMMON_CLASSES.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className={COMMON_CLASSES.btnPrimary}
                >
                  {isCreating ? "Saving..." : "Create Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {isEditModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
          <div className={`${COMMON_CLASSES.modalShell} max-w-lg w-full`}>
            <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
              <h3 className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}>
                <Edit2 className="text-[#0F8A65]" size={18} />
                Edit Document
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className={COMMON_CLASSES.labelUppercase}>Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                  className={COMMON_CLASSES.selectBase + " w-full"}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>Content Body</label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={COMMON_CLASSES.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={COMMON_CLASSES.btnPrimary}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && docToDelete && (
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
                To delete <span className="font-bold text-[#0F2D29]">{docToDelete.title}</span>, please type <span className="font-bold text-rose-600">DELETE</span> below.
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

export default Documents;
