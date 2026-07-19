import {
  ShieldCheck,
  ShieldOff,
  LogOut,
  Camera,
  Monitor,
  Check,
  User,
  Mail,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";
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

export default function Settings() {
  const { openMobileNav } = useDashboardContext();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const onProfileInvalid = (errors: typeof profileForm.formState.errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) toast.error(firstError.message as string);
  };

  const onProfileSubmit = (values: ProfileFormData) => {
    console.log("Profile submit:", values);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const onPasswordInvalid = (errors: typeof passwordForm.formState.errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) toast.error(firstError.message as string);
  };

  const onPasswordSubmit = (values: PasswordFormData) => {
    console.log("Password submit:", values);
    toast.success("Password updated");
    passwordForm.reset();
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Manage your profile and account security"
        onMenuClick={openMobileNav}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            <div className="lg:col-span-2">
              <form
                onSubmit={profileForm.handleSubmit(
                  onProfileSubmit,
                  onProfileInvalid,
                )}
              >
                <SettingsCard
                  title="Profile"
                  description="This is how your name and photo appear across Gravity."
                  footer={
                    <button
                      type="submit"
                      className="bg-[#0F2D29] h-11 text-white text-[13px] font-medium px-5 py-2 rounded-lg hover:bg-[#0F2D29]/90 active:scale-[0.98] transition-all inline-flex items-center gap-1.5 min-w-32 justify-center"
                    >
                      {saved ? (
                        <>
                          <Check size={14} />
                          Saved
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </button>
                  }
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0 group">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-[20px] font-semibold text-[#0F2D29] ring-4 ring-[#8FE3C4]/15 transition-shadow group-hover:ring-[#8FE3C4]/30"
                          style={{ backgroundColor: "#8FE3C4" }}
                        >
                          {initials}
                        </div>
                        <button
                          type="button"
                          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0F2D29] text-white flex items-center justify-center border-2 border-white hover:bg-[#0F2D29]/90 active:scale-95 transition-all"
                          aria-label="Change photo"
                        >
                          <Camera size={12} />
                        </button>
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
              title="Session"
              description="End your session on this device."
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-[#0F2D29]/3 border border-[#0F2D29]/6">
                  <div className="w-8 h-8 rounded-md bg-white border border-[#0F2D29]/8 flex items-center justify-center text-[#5B6E68] shrink-0">
                    <Monitor size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#0F2D29] text-[12.5px] font-medium truncate">
                      This device
                    </p>
                    <p className="text-[#8FA69E] text-[11px] mt-0.5">
                      Active now
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-[#B85E2E] bg-[#E98A57]/12 px-3.5 py-2.5 rounded-lg hover:bg-[#E98A57]/20 active:scale-[0.98] transition-all"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            </SettingsCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
            <div className="lg:col-span-2">
              <SettingsCard
                title="Two-factor authentication"
                description="Add an extra layer of security."
              >
                <div className="flex items-center justify-between gap-5 h-full">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        is2FAEnabled
                          ? "bg-[#8FE3C4]/20 text-[#0F8A65]"
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
                          Email codes
                        </p>
                        <span
                          className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            is2FAEnabled
                              ? "bg-[#8FE3C4]/25 text-[#0F8A65]"
                              : "bg-[#0F2D29]/6 text-[#8FA69E]"
                          }`}
                        >
                          {is2FAEnabled ? "On" : "Off"}
                        </span>
                      </div>
                      <p className="text-[#5B6E68] text-[12px] mt-0.5 leading-snug text-center">
                        One-time code on every sign-in.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIs2FAEnabled((v) => !v)}
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
                      cursor: "pointer",
                      padding: 0,
                      backgroundColor: is2FAEnabled
                        ? "#0F8A65"
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
                      className="w-full h-11 bg-[#0F2D29] text-white text-[13px] font-medium rounded-lg hover:bg-[#0F2D29]/90 active:scale-[0.98] transition-all"
                    >
                      Update password
                    </button>
                  </div>
                </SettingsCard>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
