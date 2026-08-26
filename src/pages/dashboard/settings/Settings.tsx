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
  Link2,
  Trash2,
  UserX,
  Loader2,
  AlertTriangle,
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
import { useLinkGoogleAccount } from "@/hooks/mutations/auth/use-link-google";
import { useReactivateAccount } from "@/hooks/mutations/auth/use-reactivate-account";
import { useGetSessions } from "@/hooks/queries/auth/use-get-sessions";
import { useGetUserById } from "@/hooks/queries/users/use-get-user-by-id";
import { useDeactivateAccount } from "@/hooks/mutations/settings/use-deactivate-account";
import { useDeleteAccount } from "@/hooks/mutations/settings/use-delete-account";
import { useUpdateNotificationPreferences } from "@/hooks/mutations/settings/use-update-notification-preferences";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useRegenerateInviteCode } from "@/hooks/mutations/workspace/use-regenerate-invite-code";
import { FONT_GOLDMAN } from "@/components/common/design-system";
import { GoogleIcon, SocialButton } from "@/components/button/SocialButton";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

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
  const linkGoogleMutation = useLinkGoogleAccount();
  const deactivateAccountMutation = useDeactivateAccount();
  const deleteAccountMutation = useDeleteAccount();
  const reactivateAccountMutation = useReactivateAccount();

  const { data: sessions = [], isLoading: isSessionsLoading } =
    useGetSessions();
  const { data: publicProfile } = useGetUserById(user?.id ?? "");

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
  const isLocalAccount = (user as any)?.authProvider !== "google";
  const isGoogleAccount = (user as any)?.authProvider === "google";
  const [show2FAPasswordForm, setShow2FAPasswordForm] = useState(false);
  const [twoFAPassword, setTwoFAPassword] = useState("");
  const [showGoogleLinkOverlay, setShowGoogleLinkOverlay] = useState(false);
  const [showGoogleActionOverlay, setShowGoogleActionOverlay] = useState(false);
  const [pendingAccountAction, setPendingAccountAction] = useState<
    "deactivate" | "delete" | null
  >(null);
  const [accountActionPassword, setAccountActionPassword] = useState("");
  const [showDeactivateForm, setShowDeactivateForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [reactivateEmail, setReactivateEmail] = useState("");
  const [reactivatePassword, setReactivatePassword] = useState("");

  const handleToggle2FA = () => {
    if (is2FAPending) return;

    if (isLocalAccount) {
      setShow2FAPasswordForm(true);
      return;
    }

    if (is2FAEnabled) {
      disableTwoFAMutation.mutate(undefined, {
        onSuccess: () => setShow2FAPasswordForm(false),
      });
    } else {
      enableTwoFAMutation.mutate(undefined, {
        onSuccess: () => setShow2FAPasswordForm(false),
      });
    }
  };

  const handleConfirm2FA = () => {
    if (!twoFAPassword.trim()) {
      toast.error("Please enter your password to continue.");
      return;
    }

    const onComplete = {
      onSuccess: () => {
        setShow2FAPasswordForm(false);
        setTwoFAPassword("");
      },
    };

    if (is2FAEnabled) {
      disableTwoFAMutation.mutate(twoFAPassword, onComplete);
    } else {
      enableTwoFAMutation.mutate(twoFAPassword, onComplete);
    }
  };

  const formatSessionDate = (value: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return "Unknown time";
    }
  };

  const handleGoogleLinkSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google sign-in failed. Please try again.");
      setShowGoogleLinkOverlay(false);
      return;
    }

    linkGoogleMutation.mutate(credentialResponse.credential, {
      onSettled: () => setShowGoogleLinkOverlay(false),
    });
  };

  const handleGoogleActionSuccess = (
    credentialResponse: CredentialResponse,
  ) => {
    if (!credentialResponse.credential || !pendingAccountAction) {
      toast.error("Google verification failed. Please try again.");
      setShowGoogleActionOverlay(false);
      setPendingAccountAction(null);
      return;
    }

    const payload = { idToken: credentialResponse.credential };
    const onSettled = () => {
      setShowGoogleActionOverlay(false);
      setPendingAccountAction(null);
    };

    if (pendingAccountAction === "deactivate") {
      deactivateAccountMutation.mutate(payload, { onSettled });
      return;
    }

    deleteAccountMutation.mutate(payload, { onSettled });
  };

  const handleConfirmDeactivate = () => {
    if (!accountActionPassword.trim()) {
      toast.error("Please enter your password to deactivate your account.");
      return;
    }

    deactivateAccountMutation.mutate(
      { password: accountActionPassword },
      {
        onSuccess: () => {
          setShowDeactivateForm(false);
          setAccountActionPassword("");
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!accountActionPassword.trim()) {
      toast.error("Please enter your password to delete your account.");
      return;
    }

    deleteAccountMutation.mutate(
      { password: accountActionPassword },
      {
        onSuccess: () => {
          setShowDeleteForm(false);
          setAccountActionPassword("");
        },
      },
    );
  };

  const handleReactivateAccount = () => {
    if (!reactivateEmail.trim() || !reactivatePassword.trim()) {
      toast.error("Email and password are required to reactivate an account.");
      return;
    }

    reactivateAccountMutation.mutate({
      email: reactivateEmail.trim(),
      password: reactivatePassword,
    });
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
                        {publicProfile && (
                          <p className="text-[#8FA69E] text-[11px] mt-1">
                            Public profile: {publicProfile.name}
                          </p>
                        )}
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
              title="Active Sessions"
              description="Devices where your Gravity account is currently signed in."
            >
              <div className="flex flex-col gap-4">
                {isSessionsLoading ? (
                  <div className="flex items-center justify-center py-6 text-[#5B6E68] text-[12.5px] gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Loading sessions...
                  </div>
                ) : sessions.length > 0 ? (
                  <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {sessions.map((session, index) => (
                      <div
                        key={`${session.id}-${index}`}
                        className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-[#0F2D29]/3 border border-[#0F2D29]/6"
                      >
                        <div className="w-8 h-8 rounded-md bg-white border border-[#0F2D29]/8 flex items-center justify-center text-[#5B6E68] shrink-0">
                          <Monitor size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[#0F2D29] text-[12.5px] font-medium truncate">
                            {session.userAgent}
                          </p>
                          <p className="text-[#8FA69E] text-[11px] mt-0.5">
                            Signed in {formatSessionDate(session.createdAt)}
                          </p>
                        </div>
                        {index === sessions.length - 1 && (
                          <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#8FE3C4]/25 text-[#0F2D29]">
                            Current
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}

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
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-center justify-between gap-5">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
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

                  {show2FAPasswordForm && isLocalAccount && (
                    <div className="rounded-lg border border-[#0F2D29]/8 bg-[#0F2D29]/3 p-3.5 space-y-3">
                      <p className="text-[#5B6E68] text-[12px] leading-snug">
                        Enter your password to {is2FAEnabled ? "disable" : "enable"}{" "}
                        two-factor authentication.
                      </p>
                      <BasePasswordInput
                        value={twoFAPassword}
                        onChange={(event) => setTwoFAPassword(event.target.value)}
                        placeholder="Your password"
                        autoComplete="current-password"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleConfirm2FA}
                          disabled={is2FAPending}
                          className="text-[12.5px] font-medium text-white bg-[#0F2D29] px-3.5 py-2 rounded-lg hover:bg-[#0F2D29]/90 disabled:opacity-60"
                        >
                          {is2FAPending ? "Saving..." : "Confirm"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShow2FAPasswordForm(false);
                            setTwoFAPassword("");
                          }}
                          className="text-[12.5px] font-medium text-[#5B6E68] px-3.5 py-2 rounded-lg hover:bg-[#0F2D29]/5"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
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
                  description={
                    isGoogleAccount
                      ? "Password change is only available for email/password accounts."
                      : "We'll sign you out of other sessions once this is updated."
                  }
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
                        disabled={isGoogleAccount}
                        {...passwordForm.register("currentPassword")}
                      />
                    </FormField>
                    <FormField label="New password" htmlFor="newPassword">
                      <BasePasswordInput
                        id="newPassword"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isGoogleAccount}
                        {...passwordForm.register("newPassword")}
                      />
                    </FormField>
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending || isGoogleAccount}
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

          {/* Connected Accounts & Account Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            <SettingsCard
              title="Connected accounts"
              description="Link sign-in providers to your Gravity account."
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-[#0F2D29]/10 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#0F2D29]/6 flex items-center justify-center shrink-0">
                      <GoogleIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#0F2D29] text-[13px] font-medium">
                        Google
                      </p>
                      <p className="text-[#5B6E68] text-[12px] mt-0.5">
                        {isGoogleAccount
                          ? "Connected to your account"
                          : "Link Google for faster sign-in"}
                      </p>
                    </div>
                  </div>
                  {isGoogleAccount ? (
                    <span className="shrink-0 text-[10px] font-medium px-2 py-1 rounded bg-[#8FE3C4]/25 text-[#0F2D29]">
                      Connected
                    </span>
                  ) : (
                    <div className="relative h-10 min-w-[148px]">
                      <SocialButton
                        icon={
                          linkGoogleMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Link2 size={14} />
                          )
                        }
                        label={linkGoogleMutation.isPending ? "Linking..." : "Link Google"}
                        onClick={() => setShowGoogleLinkOverlay(true)}
                        className="h-10 px-3 text-[12.5px]"
                      />
                      {showGoogleLinkOverlay && (
                        <div className="absolute inset-0 opacity-0 [&>div]:h-full [&>div]:w-full [&_iframe]:h-full! [&_iframe]:w-full! overflow-hidden">
                          <GoogleLogin
                            onSuccess={handleGoogleLinkSuccess}
                            onError={() => {
                              toast.error("Google linking failed. Please try again.");
                              setShowGoogleLinkOverlay(false);
                            }}
                            width="100%"
                            text="continue_with"
                            useOneTap={false}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </SettingsCard>

            <SettingsCard
              title="Account recovery"
              description="Reactivate a previously deactivated account."
            >
              <div className="flex flex-col gap-3">
                <FormField label="Email" htmlFor="reactivateEmail">
                  <BaseInput
                    id="reactivateEmail"
                    icon={Mail}
                    type="email"
                    placeholder="deactivated@example.com"
                    value={reactivateEmail}
                    onChange={(event) => setReactivateEmail(event.target.value)}
                  />
                </FormField>
                <FormField label="Password" htmlFor="reactivatePassword">
                  <BasePasswordInput
                    id="reactivatePassword"
                    placeholder="Account password"
                    value={reactivatePassword}
                    onChange={(event) => setReactivatePassword(event.target.value)}
                    autoComplete="current-password"
                  />
                </FormField>
                <button
                  type="button"
                  onClick={handleReactivateAccount}
                  disabled={reactivateAccountMutation.isPending}
                  className="w-full h-10 bg-[#0F2D29] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#0F2D29]/90 disabled:opacity-60"
                >
                  {reactivateAccountMutation.isPending
                    ? "Reactivating..."
                    : "Reactivate account"}
                </button>
              </div>
            </SettingsCard>
          </div>

          {/* Danger Zone */}
          <SettingsCard
            title="Danger zone"
            description="Deactivate or permanently delete your Gravity account."
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-lg border border-[#E98A57]/25 bg-[#E98A57]/6 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#E98A57]/20 flex items-center justify-center text-[#B85E2E] shrink-0">
                    <UserX size={16} />
                  </div>
                  <div>
                    <p className="text-[#0F2D29] text-[13px] font-medium">
                      Deactivate account
                    </p>
                    <p className="text-[#5B6E68] text-[12px] mt-0.5 leading-snug">
                      Temporarily disable your account. You can reactivate it later.
                    </p>
                  </div>
                </div>

                {!showDeactivateForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeactivateForm(true);
                      setShowDeleteForm(false);
                    }}
                    className="text-[12.5px] font-medium text-[#B85E2E] bg-white border border-[#E98A57]/25 px-3.5 py-2 rounded-lg hover:bg-[#E98A57]/10"
                  >
                    Deactivate account
                  </button>
                ) : (
                  <div className="space-y-3">
                    {isLocalAccount ? (
                      <BasePasswordInput
                        value={accountActionPassword}
                        onChange={(event) =>
                          setAccountActionPassword(event.target.value)
                        }
                        placeholder="Confirm with your password"
                        autoComplete="current-password"
                      />
                    ) : (
                      <div className="relative h-10">
                        <SocialButton
                          icon={<GoogleIcon />}
                          label="Verify with Google"
                          onClick={() => {
                            setPendingAccountAction("deactivate");
                            setShowGoogleActionOverlay(true);
                          }}
                          className="h-10 text-[12.5px]"
                        />
                        {showGoogleActionOverlay &&
                          pendingAccountAction === "deactivate" && (
                            <div className="absolute inset-0 opacity-0 [&>div]:h-full [&>div]:w-full [&_iframe]:h-full! [&_iframe]:w-full! overflow-hidden">
                              <GoogleLogin
                                onSuccess={handleGoogleActionSuccess}
                                onError={() => {
                                  toast.error("Google verification failed.");
                                  setShowGoogleActionOverlay(false);
                                  setPendingAccountAction(null);
                                }}
                                width="100%"
                                text="continue_with"
                                useOneTap={false}
                              />
                            </div>
                          )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {isLocalAccount && (
                        <button
                          type="button"
                          onClick={handleConfirmDeactivate}
                          disabled={deactivateAccountMutation.isPending}
                          className="text-[12.5px] font-medium text-white bg-[#B85E2E] px-3.5 py-2 rounded-lg hover:bg-[#B85E2E]/90 disabled:opacity-60"
                        >
                          {deactivateAccountMutation.isPending
                            ? "Deactivating..."
                            : "Confirm deactivate"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeactivateForm(false);
                          setAccountActionPassword("");
                        }}
                        className="text-[12.5px] font-medium text-[#5B6E68] px-3.5 py-2 rounded-lg hover:bg-[#0F2D29]/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                    <Trash2 size={16} />
                  </div>
                  <div>
                    <p className="text-[#0F2D29] text-[13px] font-medium">
                      Delete account
                    </p>
                    <p className="text-[#5B6E68] text-[12px] mt-0.5 leading-snug">
                      Permanently remove your account and associated data.
                    </p>
                  </div>
                </div>

                {!showDeleteForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteForm(true);
                      setShowDeactivateForm(false);
                    }}
                    className="text-[12.5px] font-medium text-red-600 bg-white border border-red-200 px-3.5 py-2 rounded-lg hover:bg-red-100"
                  >
                    Delete account
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-red-700 text-[12px]">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <p>This action is permanent and cannot be undone.</p>
                    </div>
                    {isLocalAccount ? (
                      <BasePasswordInput
                        value={accountActionPassword}
                        onChange={(event) =>
                          setAccountActionPassword(event.target.value)
                        }
                        placeholder="Confirm with your password"
                        autoComplete="current-password"
                      />
                    ) : (
                      <div className="relative h-10">
                        <SocialButton
                          icon={<GoogleIcon />}
                          label="Verify with Google"
                          onClick={() => {
                            setPendingAccountAction("delete");
                            setShowGoogleActionOverlay(true);
                          }}
                          className="h-10 text-[12.5px]"
                        />
                        {showGoogleActionOverlay &&
                          pendingAccountAction === "delete" && (
                            <div className="absolute inset-0 opacity-0 [&>div]:h-full [&>div]:w-full [&_iframe]:h-full! [&_iframe]:w-full! overflow-hidden">
                              <GoogleLogin
                                onSuccess={handleGoogleActionSuccess}
                                onError={() => {
                                  toast.error("Google verification failed.");
                                  setShowGoogleActionOverlay(false);
                                  setPendingAccountAction(null);
                                }}
                                width="100%"
                                text="continue_with"
                                useOneTap={false}
                              />
                            </div>
                          )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {isLocalAccount && (
                        <button
                          type="button"
                          onClick={handleConfirmDelete}
                          disabled={deleteAccountMutation.isPending}
                          className="text-[12.5px] font-medium text-white bg-red-600 px-3.5 py-2 rounded-lg hover:bg-red-600/90 disabled:opacity-60"
                        >
                          {deleteAccountMutation.isPending
                            ? "Deleting..."
                            : "Confirm delete"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteForm(false);
                          setAccountActionPassword("");
                        }}
                        className="text-[12.5px] font-medium text-[#5B6E68] px-3.5 py-2 rounded-lg hover:bg-[#0F2D29]/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SettingsCard>

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
