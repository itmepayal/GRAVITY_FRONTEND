import { useEffect, useState } from "react";
import type { NotificationPreferences } from "@/types/user";
import { useUpdateNotificationPreferences } from "@/hooks/mutations/settings";
import { useCurrentUser } from "@/hooks/queries/settings";
import { useAuthStore } from "@/store/auth.store";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationSummary,
  resolveNotificationPreferences,
} from "@/components/settings/settings.utils";

export function useNotificationSettings() {
  const { data: user, isLoading, isError, refetch } = useCurrentUser();
  const updateMutation = useUpdateNotificationPreferences();
  const updateUser = useAuthStore((state) => state.updateUser);

  const [prefs, setPrefs] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );

  useEffect(() => {
    setPrefs(resolveNotificationPreferences(user?.notificationPreferences));
  }, [user?.notificationPreferences]);

  const handleToggle = (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    const previous = prefs;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);

    updateMutation.mutate(updated, {
      onSuccess: (response) => {
        const savedUser = response?.data;
        if (savedUser?.notificationPreferences) {
          const resolved = resolveNotificationPreferences(
            savedUser.notificationPreferences,
          );
          setPrefs(resolved);
          if (user) {
            updateUser({ ...user, notificationPreferences: resolved });
          }
        }
      },
      onError: () => {
        setPrefs(previous);
      },
    });
  };

  return {
    user,
    prefs,
    summary: getNotificationSummary(prefs),
    isLoading,
    isError,
    isSaving: updateMutation.isPending,
    refetch,
    handleToggle,
  };
}
