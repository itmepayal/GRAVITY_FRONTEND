export type AnalyticsPeriod = "daily" | "weekly" | "monthly" | "quarterly";

export interface IAnalyticsContributor {
  user: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  } | string;
  tasksCompleted: number;
  minutesLogged: number;
}

export interface IAnalyticsMetrics {
  tasks: {
    created: number;
    completed: number;
    overdue: number;
    total: number;
    storyPointsCompleted: number;
  };
  timeTracking: {
    totalMinutesLogged: number;
    totalHoursLogged: number;
    entriesCount: number;
  };
  sprints: {
    activeCount: number;
    velocity: number;
    completionRate: number;
  };
  team: {
    activeMembersCount: number;
    topContributors: IAnalyticsContributor[];
  };
  breakdownByStatus: Record<string, number>;
  breakdownByPriority: Record<string, number>;
}

export interface IAnalyticsOverview {
  workspace: string;
  project?: string | null;
  period: AnalyticsPeriod;
  snapshotDate: string;
  metrics: IAnalyticsMetrics;
}

export interface IAnalyticsSnapshot {
  _id: string;
  id?: string;
  workspace: string;
  project?: { _id: string; name: string } | string | null;
  period: AnalyticsPeriod;
  snapshotDate: string;
  metrics: IAnalyticsMetrics;
  metadata?: Record<string, any>;
  createdBy?: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  } | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetAnalyticsQueryParams {
  workspaceId: string;
  projectId?: string;
  period?: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}

export interface CreateAnalyticsSnapshotPayload {
  workspace: string;
  project?: string | null;
  period?: AnalyticsPeriod;
  metadata?: Record<string, any>;
}
