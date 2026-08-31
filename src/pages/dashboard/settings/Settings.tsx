import { Bell, Building2, Shield, User } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { WorkspaceSettings } from "@/components/settings/WorkspaceSettings";
import { SettingsProfileBanner } from "@/components/settings/SettingsProfileBanner";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsQuickNav } from "@/components/settings/SettingsQuickNav";
import { useNotificationSettings } from "@/hooks/settings/use-notification-settings";

export default function Settings() {
  const { openMobileNav, currentWorkspaceId } = useDashboardContext();
  const { summary: notificationSummary } = useNotificationSettings();

  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Manage your account, security, and workspace preferences"
        onMenuClick={openMobileNav}
      />
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8">
        <SettingsProfileBanner notificationSummary={notificationSummary} />

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="w-full lg:sticky lg:top-6 lg:z-10 lg:w-[220px] xl:w-[240px]">
            <SettingsQuickNav />
          </aside>

          <div className="flex min-w-0 w-full flex-col gap-5">
            <SettingsSection
              id="profile"
              icon={User}
              title="Profile"
              subtitle="Your name, photo, and sign-in preferences."
            >
              <ProfileSettings />
            </SettingsSection>

            <SettingsSection
              id="security"
              icon={Shield}
              title="Security & Account"
              subtitle="Sessions, password, and account actions."
            >
              <SecuritySettings />
            </SettingsSection>

            <SettingsSection
              id="notifications"
              icon={Bell}
              title="Notifications"
              subtitle={notificationSummary}
            >
              <NotificationSettings />
            </SettingsSection>

            <SettingsSection
              id="workspace"
              icon={Building2}
              title="Workspace"
              subtitle="Sharing and access for your current workspace."
            >
              <WorkspaceSettings currentWorkspaceId={currentWorkspaceId} />
            </SettingsSection>
          </div>
        </div>
      </main>
    </>
  );
}
