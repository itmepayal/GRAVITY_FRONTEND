import {
  AlertTriangle,
  Loader2,
  LogOut,
  Monitor,
  Trash2,
  UserX,
  Mail,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { FormField } from "@/components/form/BaseFromField";
import { BaseInput } from "@/components/form/BaseInput";
import { BasePasswordInput } from "@/components/form/BasePasswordInput";
import { GoogleIcon, SocialButton } from "@/components/button/SocialButton";
import { AccountPreferencesPanel } from "@/components/settings/AccountPreferencesPanel";
import { SettingsButton } from "@/components/settings/SettingsButton";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { formatSessionDate } from "@/components/settings/settings.utils";
import { useSecuritySettings } from "@/hooks/settings/use-security-settings";

export function SecuritySettings() {
  const {
    sessions,
    isSessionsLoading,
    isLocalAccount,
    isGoogleAccount,
    otherSessionsCount,
    showGoogleActionOverlay,
    pendingAccountAction,
    setPendingAccountAction,
    setShowGoogleActionOverlay,
    accountActionPassword,
    setAccountActionPassword,
    showDeactivateForm,
    setShowDeactivateForm,
    showDeleteForm,
    setShowDeleteForm,
    reactivateEmail,
    setReactivateEmail,
    reactivatePassword,
    setReactivatePassword,
    passwordForm,
    changePasswordMutation,
    logoutMutation,
    deactivateAccountMutation,
    deleteAccountMutation,
    reactivateAccountMutation,
    revokeSessionMutation,
    revokeOtherSessionsMutation,
    handleGoogleActionSuccess,
    handleConfirmDeactivate,
    handleConfirmDelete,
    handleReactivate,
    onPasswordSubmit,
  } = useSecuritySettings();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SettingsPanel
          title="Active sessions"
          description="Devices signed in to your account."
          className="lg:col-span-2"
        >
          {isSessionsLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-[12.5px] text-[#5B6E68]">
              <Loader2 size={14} className="animate-spin" />
              Loading sessions...
            </div>
          ) : sessions.length > 0 ? (
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 rounded-lg border border-[#0F2D29]/8 bg-white px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#0F2D29]/8 bg-[#F8F7F3] text-[#5B6E68]">
                    <Monitor size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-[#0F2D29]">
                      {session.userAgent}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#8FA69E]">
                      {formatSessionDate(session.createdAt)}
                    </p>
                  </div>
                  {session.isCurrent ? (
                    <span className="shrink-0 rounded bg-[#8FE3C4]/25 px-1.5 py-0.5 text-[10px] font-bold text-[#0F2D29]">
                      Current
                    </span>
                  ) : (
                    <SettingsButton
                      variant="secondary"
                      className="h-7 px-2.5 text-[11px]"
                      onClick={() => revokeSessionMutation.mutate(session.id)}
                      disabled={revokeSessionMutation.isPending}
                    >
                      Revoke
                    </SettingsButton>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-[12.5px] text-[#5B6E68]">
              No active sessions found.
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {otherSessionsCount > 0 && (
              <SettingsButton
                variant="secondary"
                className="flex-1 text-[#B85E2E]"
                onClick={() => revokeOtherSessionsMutation.mutate()}
                disabled={revokeOtherSessionsMutation.isPending}
              >
                Sign out others ({otherSessionsCount})
              </SettingsButton>
            )}
            <SettingsButton
              variant="secondary"
              className="flex-1 text-[#B85E2E]"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut size={14} />
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </SettingsButton>
          </div>
        </SettingsPanel>

        <AccountPreferencesPanel />
      </div>

      <SettingsPanel
        title="Password & account recovery"
        description="Update your password or reactivate a deactivated account."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="rounded-xl border border-[#0F2D29]/10 bg-[#F8F7F3]/50 p-4"
          >
            <p className="text-[13px] font-semibold text-[#0F2D29]">
              Change password
            </p>
            <p className="mt-0.5 text-[11.5px] text-[#5B6E68]">
              {isGoogleAccount
                ? "Available for email/password accounts only."
                : "Other sessions will be signed out after update."}
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <FormField label="Current password" htmlFor="currentPassword">
                <BasePasswordInput
                  id="currentPassword"
                  disabled={isGoogleAccount}
                  {...passwordForm.register("currentPassword")}
                />
              </FormField>
              <FormField label="New password" htmlFor="newPassword">
                <BasePasswordInput
                  id="newPassword"
                  disabled={isGoogleAccount}
                  {...passwordForm.register("newPassword")}
                />
              </FormField>
              <SettingsButton
                type="submit"
                className="h-10 w-full"
                disabled={changePasswordMutation.isPending || isGoogleAccount}
              >
                {changePasswordMutation.isPending
                  ? "Updating..."
                  : "Update password"}
              </SettingsButton>
            </div>
          </form>

          <div className="rounded-xl border border-[#0F2D29]/10 bg-[#F8F7F3]/50 p-4">
            <p className="text-[13px] font-semibold text-[#0F2D29]">
              Account recovery
            </p>
            <p className="mt-0.5 text-[11.5px] text-[#5B6E68]">
              Reactivate a previously deactivated account.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <FormField label="Email" htmlFor="reactivateEmail">
                <BaseInput
                  id="reactivateEmail"
                  icon={Mail}
                  type="email"
                  placeholder="deactivated@example.com"
                  value={reactivateEmail}
                  onChange={(e) => setReactivateEmail(e.target.value)}
                />
              </FormField>
              <FormField label="Password" htmlFor="reactivatePassword">
                <BasePasswordInput
                  id="reactivatePassword"
                  placeholder="Account password"
                  value={reactivatePassword}
                  onChange={(e) => setReactivatePassword(e.target.value)}
                />
              </FormField>
              <SettingsButton
                className="h-10 w-full"
                onClick={handleReactivate}
                disabled={reactivateAccountMutation.isPending}
              >
                {reactivateAccountMutation.isPending
                  ? "Reactivating..."
                  : "Reactivate account"}
              </SettingsButton>
            </div>
          </div>
        </div>
      </SettingsPanel>

      <SettingsPanel title="Danger zone" description="Irreversible account actions.">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <DangerAction
            icon={UserX}
            title="Deactivate account"
            description="Temporarily disable your account."
            tone="warning"
            showForm={showDeactivateForm}
            onOpen={() => {
              setShowDeactivateForm(true);
              setShowDeleteForm(false);
            }}
            isLocalAccount={isLocalAccount}
            accountActionPassword={accountActionPassword}
            onPasswordChange={setAccountActionPassword}
            onConfirm={handleConfirmDeactivate}
            isPending={deactivateAccountMutation.isPending}
            confirmLabel="Confirm deactivate"
            onGoogleVerify={() => {
              setPendingAccountAction("deactivate");
              setShowGoogleActionOverlay(true);
            }}
            showGoogleOverlay={
              showGoogleActionOverlay && pendingAccountAction === "deactivate"
            }
            onGoogleSuccess={handleGoogleActionSuccess}
            onGoogleError={() => {
              setShowGoogleActionOverlay(false);
              setPendingAccountAction(null);
            }}
          />

          <DangerAction
            icon={Trash2}
            title="Delete account"
            description="Permanently remove your account."
            tone="danger"
            showForm={showDeleteForm}
            onOpen={() => {
              setShowDeleteForm(true);
              setShowDeactivateForm(false);
            }}
            isLocalAccount={isLocalAccount}
            accountActionPassword={accountActionPassword}
            onPasswordChange={setAccountActionPassword}
            onConfirm={handleConfirmDelete}
            isPending={deleteAccountMutation.isPending}
            confirmLabel="Confirm delete"
            warning="This action is permanent and cannot be undone."
            onGoogleVerify={() => {
              setPendingAccountAction("delete");
              setShowGoogleActionOverlay(true);
            }}
            showGoogleOverlay={
              showGoogleActionOverlay && pendingAccountAction === "delete"
            }
            onGoogleSuccess={handleGoogleActionSuccess}
            onGoogleError={() => {
              setShowGoogleActionOverlay(false);
              setPendingAccountAction(null);
            }}
          />
        </div>
      </SettingsPanel>
    </div>
  );
}

type DangerActionProps = {
  icon: typeof UserX;
  title: string;
  description: string;
  tone: "warning" | "danger";
  showForm: boolean;
  onOpen: () => void;
  isLocalAccount: boolean;
  accountActionPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirm: () => void;
  isPending: boolean;
  confirmLabel: string;
  warning?: string;
  onGoogleVerify: () => void;
  showGoogleOverlay: boolean;
  onGoogleSuccess: (response: import("@react-oauth/google").CredentialResponse) => void;
  onGoogleError: () => void;
};

function DangerAction({
  icon: Icon,
  title,
  description,
  tone,
  showForm,
  onOpen,
  isLocalAccount,
  accountActionPassword,
  onPasswordChange,
  onConfirm,
  isPending,
  confirmLabel,
  warning,
  onGoogleVerify,
  showGoogleOverlay,
  onGoogleSuccess,
  onGoogleError,
}: DangerActionProps) {
  const borderClass =
    tone === "danger"
      ? "border-red-200 bg-red-50"
      : "border-[#E98A57]/25 bg-[#E98A57]/6";
  const iconClass = tone === "danger" ? "text-red-600" : "text-[#B85E2E]";

  return (
    <div className={`rounded-xl border p-4 ${borderClass}`}>
      <div className="flex items-start gap-3">
        <Icon size={16} className={`mt-0.5 shrink-0 ${iconClass}`} />
        <div>
          <p className="text-[13px] font-semibold text-[#0F2D29]">{title}</p>
          <p className="mt-0.5 text-[12px] text-[#5B6E68]">{description}</p>
        </div>
      </div>

      {!showForm ? (
        <SettingsButton
          variant={tone === "danger" ? "danger" : "secondary"}
          className="mt-3"
          onClick={onOpen}
        >
          {title}
        </SettingsButton>
      ) : (
        <div className="mt-3 space-y-3">
          {warning && (
            <div className="flex items-start gap-2 text-[12px] text-red-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <p>{warning}</p>
            </div>
          )}
          {isLocalAccount ? (
            <BasePasswordInput
              value={accountActionPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Confirm password"
            />
          ) : (
            <div className="relative h-10">
              <SocialButton
                icon={<GoogleIcon />}
                label="Verify with Google"
                onClick={onGoogleVerify}
                className="h-10 text-[12px]"
              />
              {showGoogleOverlay && (
                <div className="absolute inset-0 overflow-hidden opacity-0">
                  <GoogleLogin
                    onSuccess={onGoogleSuccess}
                    onError={onGoogleError}
                    width="100%"
                    text="continue_with"
                    useOneTap={false}
                  />
                </div>
              )}
            </div>
          )}
          {isLocalAccount && (
            <SettingsButton
              variant={tone === "danger" ? "danger" : "primary"}
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending ? "Processing..." : confirmLabel}
            </SettingsButton>
          )}
        </div>
      )}
    </div>
  );
}
