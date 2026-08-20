import {
  ShieldCheck,
  ShieldOff,
  LogOut,
  Camera,
  Monitor,
  Check,
  User,
  Mail,
  CheckSquare,
  MessageSquare,
  BarChart,
  Building2,
  RefreshCw,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useEffect, useRef, useState } from "react";
import { SettingsCard } from "@/components/dashboard/SettingCard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/form/BaseFromField";
import { BaseInput } from "@/components/form/BaseInput";
import { BasePasswordInput } from "@/components/form/BasePasswordInput";
import { toast } from "sonner";
import {
  passwordSchema,
  profileSchema,
  type PasswordFormData,
  type ProfileFormData,
} from "@/validations/user.validation";
import { useCurrentUser } from "@/hooks/mutations/settings/use-current-user";
import { useChangeProfile } from "@/hooks/mutations/settings/use-change-profile";
import { useChangePassword } from "@/hooks/mutations/settings/use-change-password";
import { useEnableTwoFA } from "@/hooks/mutations/auth/use-enable-2fa";
import { useDisableTwoFA } from "@/hooks/mutations/auth/use-disabled-2fa";
import { useLogout } from "@/hooks/mutations/auth/use-logout";
import { useUpdateNotificationPreferences } from "@/hooks/mutations/settings/use-update-notification-preferences";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useRegenerateInviteCode } from "@/hooks/mutations/workspace/use-regenerate-invite-code";
import { FONT_GOLDMAN } from "@/components/common/design-system";

export default function Settings() {
  const { openMobileNav } = useDashboardContext();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const user = currentUser;

  const changeProfileMutation = useChangeProfile();
  const changePasswordMutation = useChangePassword();
  const logoutMutation = useLogout();
  const enableTwoFAMutation = useEnableTwoFA();
  const disableTwoFAMutation = useDisableTwoFA();
  const updateNotifMutation = useUpdateNotificationPreferences();

  // Workspaces for Workspace Admin Card
  const { data: workspacesResponse } = useGetUserWorkspaces();
  const workspaces = workspacesResponse?.data || [];
  const activeWorkspace = workspaces[0];

  const regenerateInviteMutation = useRegenerateInviteCode();

  // Notification Preferences State
  const notifPrefs = (user as any)?.notificationPreferences || {
    emailNotifications: true,
    taskAssigned: true,
    mentionAlerts: true,
    weeklyDigest: false,
  };

  const [emailNotifs, setEmailNotifs] = useState(
    notifPrefs.emailNotifications ?? true,
  );
  const [taskAssignedNotif, setTaskAssignedNotif] = useState(
    notifPrefs.taskAssigned ?? true,
  );
  const [mentionNotif, setMentionNotif] = useState(
    notifPrefs.mentionAlerts ?? true,
  );
  const [weeklyDigestNotif, setWeeklyDigestNotif] = useState(
    notifPrefs.weeklyDigest ?? false,
  );

  useEffect(() => {
    if (user && (user as any).notificationPreferences) {
      const prefs = (user as any).notificationPreferences;
      setEmailNotifs(prefs.emailNotifications ?? true);
      setTaskAssignedNotif(prefs.taskAssigned ?? true);
      setMentionNotif(prefs.mentionAlerts ?? true);
      setWeeklyDigestNotif(prefs.weeklyDigest ?? false);
    }
  }, [user]);

  const handleToggleNotif = (
    key: "emailNotifications" | "taskAssigned" | "mentionAlerts" | "weeklyDigest",
    val: boolean,
  ) => {
    let updated = {
      emailNotifications: emailNotifs,
      taskAssigned: taskAssignedNotif,
      mentionAlerts: mentionNotif,
      weeklyDigest: weeklyDigestNotif,
      [key]: val,
    };

    if (key === "emailNotifications") setEmailNotifs(val);
    if (key === "taskAssigned") setTaskAssignedNotif(val);
    if (key === "mentionAlerts") setMentionNotif(val);
    if (key === "weeklyDigest") setWeeklyDigestNotif(val);

    updateNotifMutation.mutate(updated);
  };

  const is2FAEnabled = (user as any)?.is2FAEnabled ?? false;
  const is2FAPending =
    enableTwoFAMutation.isPending || disableTwoFAMutation.isPending;

  const handleToggle2FA = () => {
    if (is2FAPending) return;
    if (is2FAEnabled) {
      disableTwoFAMutation.mutate();
    } else {
      enableTwoFAMutation.mutate();
    }
  };

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
      });
      if ((user as any)?.avatar) {
        setPhotoPreview((user as any).avatar);
      }
    }
  }, [user]);

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(
      file.type,
    );
    if (!isValidType) {
      toast.error("Please select a JPG or PNG image.");
      e.target.value = "";
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("Image must be under 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.onerror = () => {
      toast.error("Could not read that image. Please try another file.");
    };
    reader.readAsDataURL(file);

    setPhotoFile(file);
    e.target.value = "";
  };

  const onProfileInvalid = (errors: typeof profileForm.formState.errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) toast.error(firstError.message as string);
  };

  const onProfileSubmit = (values: ProfileFormData) => {
    changeProfileMutation.mutate({
      name: values.name,
      avatar: photoFile ?? null,
    });
  };

  const onPasswordInvalid = (errors: typeof passwordForm.formState.errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) toast.error(firstError.message as string);
  };

  const onPasswordSubmit = (values: PasswordFormData) => {
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        passwordForm.reset();
      },
    });
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((p: string) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Manage your profile, notification preferences, and workspace controls"
        onMenuClick={openMobileNav}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
          {/* Profile & Session Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            <div className="lg:col-span-2">
              <form
                onSubmit={profileForm.handleSubmit(
                  onProfileSubmit,
                  onProfileInvalid,
                )}
              >
                <SettingsCard
                  title="Profile Settings"
                  description="This is how your name and photo appear across Gravity."
                  footer={
                    <button
                      type="submit"
                      disabled={
                        changeProfileMutation.isPending || isUserLoading
                      }
                      className="bg-[#0F2D29] h-11 text-white text-[13px] font-medium px-5 py-2 rounded-lg hover:bg-[#0F2D29]/90 active:scale-[0.98] transition-all inline-flex items-center gap-1.5 min-w-32 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {changeProfileMutation.isSuccess ? (
                        <>
                          <Check size={14} />
                          Saved
                        </>
                      ) : changeProfileMutation.isPending ? (
                        "Saving..."
                      ) : (
                        "Save changes"
                      )}
                    </button>
                  }
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0 group">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Profile photo preview"
                            className="w-16 h-16 rounded-full object-cover ring-4 ring-[#8FE3C4]/15 transition-shadow group-hover:ring-[#8FE3C4]/30"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-[20px] font-semibold text-[#0F2D29] ring-4 ring-[#8FE3C4]/15 transition-shadow group-hover:ring-[#8FE3C4]/30"
                            style={{ backgroundColor: "#8FE3C4" }}
                          >
                            {initials}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handlePhotoButtonClick}
                          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0F2D29] text-white flex items-center justify-center border-2 border-white hover:bg-[#0F2D29]/90 active:scale-95 transition-all"
                          aria-label="Change photo"
                        >
                          <Camera size={12} />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <p className="text-[#0F2D29] text-[13.5px] font-medium">
                          Profile photo
                        </p>
                        <p className="text-[#8FA69E] text-[11.5px] mt-0.5">
                          JPG or PNG, up to 2MB
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="Full name" htmlFor="name">
                        <BaseInput
                          id="name"
                          icon={User}
                          type="text"
                          placeholder="Your name"
                          {...profileForm.register("name")}
                        />
                      </FormField>
                      <FormField label="Email address" htmlFor="email">
                        <BaseInput
                          id="email"
                          icon={Mail}
                          type="email"
                          disabled
                          className="bg-[#0F2D29]/3 text-[#5B6E68] cursor-not-allowed"
                          {...profileForm.register("email")}
                        />
                      </FormField>
                    </div>
                  </div>
                </SettingsCard>
              </form>
            </div>

            <SettingsCard
              title="Active Session"
              description="End your session on this device."
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-[#0F2D29]/3 border border-[#0F2D29]/6">
                  <div className="w-8 h-8 rounded-md bg-white border border-[#0F2D29]/8 flex items-center justify-center text-[#5B6E68] shrink-0">
                    <Monitor size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#0F2D29] text-[12.5px] font-medium truncate">
                      Current Device
                    </p>
                    <p className="text-[#8FA69E] text-[11px] mt-0.5">
                      Active session now
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-[#B85E2E] bg-[#E98A57]/12 px-3.5 py-2.5 rounded-lg hover:bg-[#E98A57]/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <LogOut size={14} />
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </button>
              </div>
            </SettingsCard>
          </div>

          {/* 2FA & Password Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
            <div className="lg:col-span-2">
              <SettingsCard
                title="Two-factor authentication"
                description="Add an extra layer of security to your account."
              >
                <div className="flex items-center justify-between gap-5 h-full">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${is2FAEnabled
                        ? "bg-[#8FE3C4]/20 text-[#0F2D29]"
                        : "bg-[#0F2D29]/6 text-[#8FA69E]"
                        }`}
                    >
                      {is2FAEnabled ? (
                        <ShieldCheck size={17} />
                      ) : (
                        <ShieldOff size={17} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[#0F2D29] text-[13px] font-medium truncate">
                          Email OTP Codes
                        </p>
                        <span
                          className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${is2FAEnabled
                            ? "bg-[#8FE3C4]/25 text-[#0F2D29]"
                            : "bg-[#0F2D29]/6 text-[#8FA69E]"
                            }`}
                        >
                          {is2FAEnabled ? "On" : "Off"}
                        </span>
                      </div>
                      <p className="text-[#5B6E68] text-[12px] mt-0.5 leading-snug">
                        One-time code required on every sign-in.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggle2FA}
                    disabled={is2FAPending || isUserLoading}
                    role="switch"
                    aria-checked={is2FAEnabled}
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      width: "44px",
                      height: "24px",
                      minWidth: "44px",
                      borderRadius: "9999px",
                      flexShrink: 0,
                      border: "none",
                      cursor: is2FAPending ? "not-allowed" : "pointer",
                      padding: 0,
                      opacity: is2FAPending ? 0.6 : 1,
                      backgroundColor: is2FAEnabled
                        ? "#0F2D29"
                        : "rgba(15,45,41,0.15)",
                      transition: "background-color 0.2s ease",
                    }}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE3C4] focus-visible:ring-offset-2"
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: "2px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "9999px",
                        backgroundColor: "#fff",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                        transform: is2FAEnabled
                          ? "translateX(20px)"
                          : "translateX(0)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              </SettingsCard>
            </div>

            <div className="lg:col-span-3">
              <form
                onSubmit={passwordForm.handleSubmit(
                  onPasswordSubmit,
                  onPasswordInvalid,
                )}
              >
                <SettingsCard
                  title="Change password"
                  description="We'll sign you out of other sessions once this is updated."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <FormField
                      label="Current password"
                      htmlFor="currentPassword"
                    >
                      <BasePasswordInput
                        id="currentPassword"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...passwordForm.register("currentPassword")}
                      />
                    </FormField>
                    <FormField label="New password" htmlFor="newPassword">
                      <BasePasswordInput
                        id="newPassword"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...passwordForm.register("newPassword")}
                      />
                    </FormField>
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="w-full h-11 bg-[#0F2D29] text-white text-[13px] font-medium rounded-lg hover:bg-[#0F2D29]/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {changePasswordMutation.isPending
                        ? "Updating..."
                        : "Update password"}
                    </button>
                  </div>
                </SettingsCard>
              </form>
            </div>
          </div>

          {/* Notification Preferences Card */}
          <SettingsCard
            title="Notification Preferences"
            description="Control which updates you receive via email and in-app alerts."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#0F2D29]/10 bg-white">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#0F8A65]" />
                  <div>
                    <p className="text-xs font-semibold text-[#0F2D29]">
                      Email Notifications
                    </p>
                    <p className="text-[11px] text-[#5B6E68]">
                      Global email updates & alerts
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) =>
                    handleToggleNotif("emailNotifications", e.target.checked)
                  }
                  className="h-4 w-4 accent-[#0F8A65]"
                />
              </div>

              {/* Task Assignments */}
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#0F2D29]/10 bg-white">
                <div className="flex items-center gap-3">
                  <CheckSquare size={16} className="text-[#0F8A65]" />
                  <div>
                    <p className="text-xs font-semibold text-[#0F2D29]">
                      Task Assignments
                    </p>
                    <p className="text-[11px] text-[#5B6E68]">
                      Alert when assigned to a new task
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={taskAssignedNotif}
                  onChange={(e) =>
                    handleToggleNotif("taskAssigned", e.target.checked)
                  }
                  className="h-4 w-4 accent-[#0F8A65]"
                />
              </div>

              {/* Mentions & Comments */}
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#0F2D29]/10 bg-white">
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-[#0F8A65]" />
                  <div>
                    <p className="text-xs font-semibold text-[#0F2D29]">
                      Mentions & Comments
                    </p>
                    <p className="text-[11px] text-[#5B6E68]">
                      Alert when tagged in discussions
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={mentionNotif}
                  onChange={(e) =>
                    handleToggleNotif("mentionAlerts", e.target.checked)
                  }
                  className="h-4 w-4 accent-[#0F8A65]"
                />
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#0F2D29]/10 bg-white">
                <div className="flex items-center gap-3">
                  <BarChart size={16} className="text-[#0F8A65]" />
                  <div>
                    <p className="text-xs font-semibold text-[#0F2D29]">
                      Weekly Activity Digest
                    </p>
                    <p className="text-[11px] text-[#5B6E68]">
                      Weekly summary email report
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigestNotif}
                  onChange={(e) =>
                    handleToggleNotif("weeklyDigest", e.target.checked)
                  }
                  className="h-4 w-4 accent-[#0F8A65]"
                />
              </div>
            </div>
          </SettingsCard>

          {/* Workspace Admin Settings Card */}
          {activeWorkspace && (
            <SettingsCard
              title="Workspace Admin Settings"
              description={`Manage controls for active workspace: ${activeWorkspace.name}`}
            >
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-lg border border-[#0F2D29]/10 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <Building2 size={18} className="text-[#0F8A65]" />
                    <div>
                      <p className="text-xs font-bold text-[#0F2D29]">
                        Workspace Invite Code
                      </p>
                      <p className={`${FONT_GOLDMAN} text-xs text-[#5B6E68] mt-0.5`}>
                        Code: {activeWorkspace.inviteCode || "N/A"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      regenerateInviteMutation.mutate(
                        activeWorkspace._id || activeWorkspace.id,
                      )
                    }
                    disabled={regenerateInviteMutation.isPending}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#0F2D29] border border-[#0F2D29]/20 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    <RefreshCw
                      size={13}
                      className={
                        regenerateInviteMutation.isPending
                          ? "animate-spin text-[#0F8A65]"
                          : ""
                      }
                    />
                    Regenerate Code
                  </button>
                </div>
              </div>
            </SettingsCard>
          )}
        </div>
      </main>
    </>
  );
}
