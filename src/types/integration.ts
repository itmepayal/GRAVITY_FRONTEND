export type IntegrationProvider =
  | "github"
  | "slack"
  | "jira"
  | "google_calendar"
  | "figma"
  | "webhook"
  | "custom";

export type IntegrationStatus = "active" | "inactive" | "error" | "pending";

export interface IIntegrationConfig {
  webhookUrl?: string;
  channelId?: string;
  repository?: string;
  apiKey?: string;
  extraSettings?: Record<string, any>;
}

export interface IIntegration {
  _id: string;
  id?: string;
  workspace: string;
  project?: { _id: string; name: string } | string | null;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  config: IIntegrationConfig;
  eventsEnabled: string[];
  createdBy?: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  } | string | null;
  lastSyncedAt?: string;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationPayload {
  workspace: string;
  project?: string | null;
  provider: IntegrationProvider;
  name: string;
  status?: IntegrationStatus;
  config?: IIntegrationConfig;
  eventsEnabled?: string[];
}

export interface UpdateIntegrationPayload {
  name?: string;
  status?: IntegrationStatus;
  config?: IIntegrationConfig;
  eventsEnabled?: string[];
}

export interface ListIntegrationsQueryParams {
  workspaceId: string;
  projectId?: string;
  provider?: IntegrationProvider;
  status?: IntegrationStatus;
}
