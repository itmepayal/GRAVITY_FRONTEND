import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";

import { useGetWorkspaceReports } from "@/hooks/queries/report/use-get-workspace-reports";
import { useCreateReport } from "@/hooks/mutations/report/use-create-report";
import { useExportReport } from "@/hooks/mutations/report/use-export-report";
import { useDeleteReport } from "@/hooks/mutations/report/use-delete-report";

import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import {
  FONT_GOLDMAN,
  FONT_POPPINS,
  COMMON_CLASSES,
} from "@/components/common/design-system";
import { toast } from "sonner";

import {
  BarChart3,
  Plus,
  Search,
  Trash2,
  X,
  FileSpreadsheet,
  FileText,
  FileCode,
  Download,
  AlertTriangle,
  Clock,
  ListChecks,
  Users,
  Calendar,
  Grid,
  List,
} from "lucide-react";
import type { IReport, ReportType, ReportFormat } from "@/types/report";

export function Reports() {
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

  // 2. Fetch Projects
  const { data: projectsResponse } = useGetWorkspaceProjects(selectedWorkspaceId);
  const projects = projectsResponse?.data || [];

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 3. Fetch Reports
  const {
    data: reportsResponse,
    isLoading: isLoadingReports,
    refetch,
  } = useGetWorkspaceReports({
    workspaceId: selectedWorkspaceId,
    project: selectedProjectId !== "all" ? selectedProjectId : undefined,
    type: selectedType !== "all" ? (selectedType as ReportType) : undefined,
    search: searchQuery.trim() || undefined,
  });

  const reports = reportsResponse?.data || [];

  // Mutations
  const { mutate: createReportMutate, isPending: isGenerating } = useCreateReport();
  const { mutate: exportReportMutate, isPending: isExporting } = useExportReport();
  const { mutate: deleteReportMutate } = useDeleteReport();

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Form State
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportType, setReportType] = useState<ReportType>("task_summary");
  const [reportFormat, setReportFormat] = useState<ReportFormat>("json");
  const [targetProjectId, setTargetProjectId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<IReport | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const activeWorkspaceName =
    workspaces.find((w: any) => (w._id || w.id) === selectedWorkspaceId)
      ?.name ?? "Workspace";

  // Metrics
  const taskSummaryCount = useMemo(() => reports.filter((r) => r.type === "task_summary").length, [reports]);
  const timeTrackingCount = useMemo(() => reports.filter((r) => r.type === "time_tracking").length, [reports]);
  const workloadCount = useMemo(() => reports.filter((r) => r.type === "workload").length, [reports]);

  const metricCards = [
    {
      title: "Generated Reports",
      value: reports.length,
      subtitle: "Total workspace reports",
      icon: BarChart3,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "Task Summaries",
      value: taskSummaryCount,
      subtitle: "Status & priority reports",
      icon: ListChecks,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Time Trackings",
      value: timeTrackingCount,
      subtitle: "Logged hours reports",
      icon: Clock,
      accentColor: "#D97706",
      bgGradient: "from-[#D97706]/10 to-transparent",
    },
    {
      title: "Team Workloads",
      value: workloadCount,
      subtitle: "Member allocation reports",
      icon: Users,
      accentColor: "#6366F1",
      bgGradient: "from-[#6366F1]/10 to-transparent",
    },
  ];

  // Handlers
  const handleOpenGenerateModal = () => {
    setReportName("");
    setReportDescription("");
    setReportType("task_summary");
    setReportFormat("json");
    setTargetProjectId("");
    setStartDate("");
    setEndDate("");
    setIsGenerateModalOpen(true);
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportName.trim()) {
      toast.error("Please enter a report name.");
      return;
    }
    if (!selectedWorkspaceId) return;

    createReportMutate(
      {
        name: reportName.trim(),
        description: reportDescription.trim(),
        workspace: selectedWorkspaceId,
        project: targetProjectId || undefined,
        type: reportType,
        format: reportFormat,
        filters: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsGenerateModalOpen(false);
          refetch();
        },
      },
    );
  };

  const handleExport = (reportId: string, format: ReportFormat) => {
    exportReportMutate({ reportId, format });
  };

  const handleRequestDelete = (report: IReport) => {
    setReportToDelete(report);
    setDeleteConfirmInput("");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportToDelete) return;

    if (deleteConfirmInput.trim().toUpperCase() !== "DELETE") {
      toast.error('Please type "DELETE" to confirm.');
      return;
    }

    deleteReportMutate(reportToDelete._id || reportToDelete.id!, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setReportToDelete(null);
        refetch();
      },
    });
  };

  const getFormatBadge = (fmt: ReportFormat) => {
    switch (fmt) {
      case "csv":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "pdf":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
    }
  };

  return (
    <>
      <Topbar
        variant="light"
        title="Reports & Analytics Dashboard"
        subtitle={`${activeWorkspaceName} · Team Metrics Stream`}
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

              {/* Type Filter */}
              <div className="min-w-44">
                <label className={COMMON_CLASSES.labelUppercase}>Report Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={COMMON_CLASSES.selectBase + " w-full"}
                >
                  <option value="all">All Report Types</option>
                  <option value="task_summary">Task Summary</option>
                  <option value="time_tracking">Time Tracking</option>
                  <option value="project_progress">Project Progress</option>
                  <option value="workload">Team Workload</option>
                </select>
              </div>

              {/* Search */}
              <div className="min-w-56 flex-1">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Search Report Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search reports..."
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
                onClick={handleOpenGenerateModal}
                className={COMMON_CLASSES.btnPrimary}
              >
                <Plus size={15} />
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid / List */}
        <div className="space-y-3">
          <h4 className={`${COMMON_CLASSES.headingTitle} text-sm flex items-center gap-2`}>
            <BarChart3 size={16} className="text-[#0F8A65]" />
            Generated Reports ({reports.length})
          </h4>

          {isLoadingReports ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 w-full animate-pulse border border-[#0F2D29]/10 bg-gray-50/60 p-4"
                />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-[#0F2D29]/15 text-center">
              <BarChart3 size={40} className="text-[#8FA69E] mb-3" />
              <h4 className={`${COMMON_CLASSES.headingTitle} text-base`}>
                No reports generated
              </h4>
              <p className={`${COMMON_CLASSES.headingSubtitle} mt-1 max-w-md`}>
                Generate task summaries, time log reports, or team workload analytics.
              </p>
              <button
                onClick={handleOpenGenerateModal}
                className={`${COMMON_CLASSES.btnPrimary} mt-5`}
              >
                <Plus size={15} />
                Generate First Report
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {reports.map((report: IReport) => {
                const dateStr = new Date(
                  report.generatedAt || report.createdAt,
                ).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={report._id || report.id}
                    className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs hover:border-[#0F8A65]/40 transition flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`${FONT_GOLDMAN} px-2 py-0.5 text-[10px] font-bold border uppercase ${getFormatBadge(report.format)}`}
                        >
                          {report.format.toUpperCase()}
                        </span>

                        <button
                          onClick={() => handleRequestDelete(report)}
                          className="text-rose-600 hover:bg-rose-50 p-1 opacity-0 group-hover:opacity-100 transition"
                          title="Delete Report"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <h5 className={`${FONT_POPPINS} text-sm font-bold text-[#0F2D29] line-clamp-1`}>
                        {report.name}
                      </h5>

                      <span className={`${FONT_GOLDMAN} text-[11px] font-bold text-[#0F8A65] block`}>
                        Type: {report.type.replace("_", " ").toUpperCase()}
                      </span>

                      {report.description && (
                        <p className={`${FONT_POPPINS} text-xs text-[#5B6E68] line-clamp-2`}>
                          {report.description}
                        </p>
                      )}
                    </div>

                    {/* Data Summary Preview */}
                    {report.data && (
                      <div className="bg-gray-50 border border-[#0F2D29]/10 p-2.5 text-[11px] font-semibold text-[#0F2D29] space-y-1">
                        {report.type === "task_summary" && (
                          <div className="flex justify-between">
                            <span>Total Tasks:</span>
                            <span className="font-bold text-[#0F8A65]">{report.data.totalTasks || 0}</span>
                          </div>
                        )}
                        {report.type === "time_tracking" && (
                          <div className="flex justify-between">
                            <span>Total Hours Logged:</span>
                            <span className="font-bold text-[#0F8A65]">{report.data.totalHours || 0} hrs</span>
                          </div>
                        )}
                        {report.type === "project_progress" && (
                          <div className="flex justify-between">
                            <span>Total Projects:</span>
                            <span className="font-bold text-[#0F8A65]">{report.data.totalProjects || 0}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Export Actions */}
                    <div className="flex items-center justify-between border-t border-[#0F2D29]/10 pt-2.5 text-[11px]">
                      <span className="text-[10px] text-[#5B6E68] flex items-center gap-1">
                        <Calendar size={11} className="text-[#8FA69E]" />
                        {dateStr}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          disabled={isExporting}
                          onClick={() => handleExport(report._id || report.id!, "csv")}
                          className="px-2 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                          title="Export CSV"
                        >
                          <FileSpreadsheet size={11} /> CSV
                        </button>
                        <button
                          disabled={isExporting}
                          onClick={() => handleExport(report._id || report.id!, "pdf")}
                          className="px-2 py-1 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 flex items-center gap-1"
                          title="Export PDF"
                        >
                          <FileText size={11} /> PDF
                        </button>
                        <button
                          disabled={isExporting}
                          onClick={() => handleExport(report._id || report.id!, "json")}
                          className="px-2 py-1 text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"
                          title="Export JSON"
                        >
                          <FileCode size={11} /> JSON
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-[#0F2D29]/15 bg-white divide-y divide-[#0F2D29]/10">
              {reports.map((report: IReport) => (
                <div
                  key={report._id || report.id}
                  className="p-3.5 hover:bg-gray-50 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <BarChart3 size={18} className="text-[#0F8A65] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className={`${FONT_POPPINS} font-bold text-[#0F2D29] truncate`}>
                          {report.name}
                        </h5>
                        <span
                          className={`${FONT_GOLDMAN} px-2 py-0.2 text-[9px] font-bold border uppercase ${getFormatBadge(report.format)}`}
                        >
                          {report.type.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5B6E68]">
                        Generated by {report.createdBy?.name || "User"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={isExporting}
                      onClick={() => handleExport(report._id || report.id!, "csv")}
                      className="px-2 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <Download size={10} /> CSV
                    </button>
                    <button
                      disabled={isExporting}
                      onClick={() => handleExport(report._id || report.id!, "pdf")}
                      className="px-2 py-1 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 flex items-center gap-1"
                    >
                      <Download size={10} /> PDF
                    </button>
                    <button
                      onClick={() => handleRequestDelete(report)}
                      className="p-1 text-rose-600 hover:bg-rose-50 ml-2"
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

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
          <div className={`${COMMON_CLASSES.modalShell} max-w-lg w-full`}>
            <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
              <h3 className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}>
                <Plus className="text-[#0F8A65]" size={18} />
                Generate Analytics Report
              </h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="p-4 space-y-4">
              <div>
                <label className={COMMON_CLASSES.labelUppercase}>Report Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Workspace Task Summary Report"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>Report Type *</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    className={COMMON_CLASSES.selectBase + " w-full"}
                  >
                    <option value="task_summary">Task Summary</option>
                    <option value="time_tracking">Time Tracking</option>
                    <option value="project_progress">Project Progress</option>
                    <option value="workload">Team Workload</option>
                  </select>
                </div>

                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>Export Format</label>
                  <select
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value as ReportFormat)}
                    className={COMMON_CLASSES.selectBase + " w-full"}
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV Spreadsheet</option>
                    <option value="pdf">PDF Document</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>Project (Optional)</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className={COMMON_CLASSES.selectBase + " w-full"}
                >
                  <option value="">All Workspace Projects</option>
                  {projects.map((p: any) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={COMMON_CLASSES.inputBase}
                  />
                </div>
                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={COMMON_CLASSES.inputBase}
                  />
                </div>
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional report description..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className={COMMON_CLASSES.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !reportName.trim()}
                  className={COMMON_CLASSES.btnPrimary}
                >
                  {isGenerating ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && reportToDelete && (
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
                To delete <span className="font-bold text-[#0F2D29]">{reportToDelete.name}</span>, please type <span className="font-bold text-rose-600">DELETE</span> below.
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

export default Reports;
