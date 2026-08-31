import { BarChart, CheckSquare, Loader2, Mail, MessageSquare } from "lucide-react";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";
import { useNotificationSettings } from "@/hooks/settings/use-notification-settings";
import type { NotificationPreferences } from "@/types/user";
import { FONT_GOLDMAN, FONT_POPPINS } from "@/components/common/design-system";

const NOTIFICATION_ITEMS: Array<{
  key: keyof NotificationPreferences;
  icon: typeof Mail;
  title: string;
  description: string;
  requiresEmail?: boolean;
}> = [
  {
    key: "emailNotifications",
    icon: Mail,
    title: "Email notifications",
    description: "Master switch for task, mention, and digest emails",
  },
  {
    key: "taskAssigned",
    icon: CheckSquare,
    title: "Task assignments",
    description: "In-app alert and email when you are assigned a task",
    requiresEmail: true,
  },
  {
    key: "mentionAlerts",
    icon: MessageSquare,
    title: "Mentions & comments",
    description: "When someone tags you with @name or @email in a comment",
    requiresEmail: true,
  },
  {
    key: "weeklyDigest",
    icon: BarChart,
    title: "Weekly digest",
    description: "Monday summary of assigned, completed, and due tasks",
    requiresEmail: true,
  },
];

export function NotificationSettings() {
  const { prefs, summary, isLoading, isError, isSaving, refetch, handleToggle } =
    useNotificationSettings();

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-[#0F2D29]/10 bg-[#F8F7F3]/40">
        <Loader2 className="h-5 w-5 animate-spin text-[#0F8A65]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-[#E98A57]/25 bg-[#E98A57]/8 p-6 text-center">
        <p className={`text-[13px] text-[#0F2D29] ${FONT_POPPINS}`}>
          Could not load notification preferences.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-[12px] font-semibold text-[#0F8A65] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[#0F2D29]/10 bg-[#F8F7F3]/50 px-4 py-3 sm:px-5">
        <p className={`text-[12px] font-bold text-[#0F2D29] ${FONT_GOLDMAN}`}>
          Current status
        </p>
        <p className={`mt-0.5 text-[11.5px] text-[#5B6E68] ${FONT_POPPINS}`}>
          {summary}. Changes apply instantly to in-app alerts and emails.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {NOTIFICATION_ITEMS.map((item) => {
          const emailBlocked =
            item.requiresEmail &&
            !prefs.emailNotifications &&
            item.key !== "emailNotifications";

          return (
            <div key={item.key} className="flex flex-col gap-1">
              <SettingsToggleRow
                icon={item.icon}
                title={item.title}
                description={item.description}
                checked={prefs[item.key]}
                onChange={(value) => handleToggle(item.key, value)}
                disabled={isSaving}
              />
              {emailBlocked && prefs[item.key] && (
                <p
                  className={`px-1 text-[10.5px] text-[#E98A57] ${FONT_POPPINS}`}
                >
                  In-app only — turn on Email notifications to receive emails.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
