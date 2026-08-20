import { api } from "@/lib/api";

export type CalendarEventType =
  | "meeting"
  | "deadline"
  | "reminder"
  | "milestone"
  | "other";

export interface ICalendarEvent {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  workspace: string | any;
  project?: string | any;
  task?: string | any;
  type: CalendarEventType;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  attendees?: any[];
  location?: string;
  color?: string;
  reminderMinutesBefore?: number;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  workspace: string;
  project?: string;
  task?: string;
  type?: CalendarEventType;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  attendees?: string[];
  location?: string;
  color?: string;
  reminderMinutesBefore?: number;
}

export interface GetCalendarEventsFilters {
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export const getWorkspaceCalendarEvents = async (
  workspaceId: string,
  filters?: GetCalendarEventsFilters,
) => {
  const params = new URLSearchParams();
  if (filters?.projectId) params.append("projectId", filters.projectId);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/calendar-events/workspace/${workspaceId}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await api.get(url);
  return response.data;
};

export const createCalendarEvent = async (data: CreateCalendarEventInput) => {
  const response = await api.post("/calendar-events", data);
  return response.data;
};

export const updateCalendarEvent = async (
  eventId: string,
  data: Partial<CreateCalendarEventInput>,
) => {
  const response = await api.patch(`/calendar-events/${eventId}`, data);
  return response.data;
};

export const deleteCalendarEvent = async (eventId: string) => {
  const response = await api.delete(`/calendar-events/${eventId}`);
  return response.data;
};
