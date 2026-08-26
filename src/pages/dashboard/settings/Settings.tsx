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
      <main className="flex-1 bg-[#F8F7F3]/50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex flex-col gap-5">
          <SettingsProfileBanner notificationSummary={notificationSummary} />
          <SettingsQuickNav />
          <SettingsSection
            id="profile"
            icon={User}
            title="Profile & Appearance"
            subtitle="Your name, photo, and personal details."
          >
            <ProfileSettings />
          </SettingsSection>
          <SettingsSection
            id="security"
            icon={Shield}
            title="Security & Account"
            subtitle="Sessions, 2FA, password, and account actions."
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
      </main>
    </>
  );
}
