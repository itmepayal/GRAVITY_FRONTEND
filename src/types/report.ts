export type ReportType =
  | "task_summary"
  | "sprint_burndown"
  | "time_tracking"
  | "project_progress"
  | "team_performance"
  | "workload"
  | "custom";

export type ReportFormat = "json" | "pdf" | "csv";
export type ReportStatus = "generating" | "ready" | "failed";

export interface IReportFilters {
  startDate?: string;
  endDate?: string;
  project?: string[];
  board?: string[];
  sprint?: string[];
  assignee?: string[];
  team?: string[];
  status?: string[];
  priority?: string[];
}

export interface IReport {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  workspace: string;
  project?: { _id: string; name: string } | string | null;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  filters: IReportFilters;
  data?: Record<string, any>;
  fileUrl?: string;
  generatedAt?: string;
  createdBy: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListReportsQueryParams {
  workspaceId: string;
  project?: string;
  type?: ReportType;
  format?: ReportFormat;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateReportPayload {
  name: string;
  description?: string;
  workspace: string;
  project?: string | null;
  type: ReportType;
  format: ReportFormat;
  filters?: IReportFilters;
}

export interface UpdateReportPayload {
  name?: string;
  description?: string;
  format?: ReportFormat;
  filters?: Record<string, any>;
}
