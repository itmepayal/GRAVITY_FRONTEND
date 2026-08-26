import type { NotificationPreferences } from "@/types/user";

export function getInitials(name?: string): string {
  if (!name?.trim()) return "?";
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatSessionDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Unknown time";
  }
}

export const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  taskAssigned: true,
  mentionAlerts: true,
  weeklyDigest: false,
};

export const NOTIFICATION_PREFERENCE_LABELS: Record<
  keyof NotificationPreferences,
  string
> = {
  emailNotifications: "Email alerts",
  taskAssigned: "Task assignments",
  mentionAlerts: "Mentions",
  weeklyDigest: "Weekly digest",
};

export function resolveNotificationPreferences(
  prefs?: Partial<NotificationPreferences> | null,
): NotificationPreferences {
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(prefs ?? {}),
  };
}

export function countEnabledNotificationPreferences(
  prefs: NotificationPreferences,
): number {
  return Object.values(prefs).filter(Boolean).length;
}

export function getNotificationSummary(
  prefs?: Partial<NotificationPreferences> | null,
): string {
  const resolved = resolveNotificationPreferences(prefs);
  const enabled = countEnabledNotificationPreferences(resolved);

  if (enabled === 0) {
    return "All alerts off";
  }

  if (enabled === Object.keys(resolved).length) {
    return "All alerts on";
  }

  const active = (Object.keys(resolved) as (keyof NotificationPreferences)[])
    .filter((key) => resolved[key])
    .map((key) => NOTIFICATION_PREFERENCE_LABELS[key]);

  return active.join(", ");
}
