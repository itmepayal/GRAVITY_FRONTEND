import { useState } from "react";
import {
  Check,
  Link2,
  Loader2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { BasePasswordInput } from "@/components/form/BasePasswordInput";
import { GoogleIcon, SocialButton } from "@/components/button/SocialButton";
import { SettingsButton } from "@/components/settings/SettingsButton";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { useCurrentUser } from "@/hooks/queries/settings";
import {
  useDisableTwoFA,
  useEnableTwoFA,
  useLinkGoogleAccount,
} from "@/hooks/mutations/settings";
import { toast } from "sonner";
import type { CredentialResponse } from "@react-oauth/google";

export function AccountPreferencesPanel() {
  const [show2FAPasswordForm, setShow2FAPasswordForm] = useState(false);
  const [twoFAPassword, setTwoFAPassword] = useState("");
  const [showGoogleLinkOverlay, setShowGoogleLinkOverlay] = useState(false);

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const enableTwoFAMutation = useEnableTwoFA();
  const disableTwoFAMutation = useDisableTwoFA();
  const linkGoogleMutation = useLinkGoogleAccount();

  const is2FAEnabled = user?.is2FAEnabled ?? false;
  const is2FAPending =
    enableTwoFAMutation.isPending || disableTwoFAMutation.isPending;
  const isLocalAccount = user?.authProvider !== "google";
  const isGoogleAccount = user?.authProvider === "google";

  const reset2FAForm = () => {
    setShow2FAPasswordForm(false);
    setTwoFAPassword("");
  };

  const handleToggle2FA = () => {
    if (is2FAPending) return;
    if (isLocalAccount) {
      setShow2FAPasswordForm(true);
      return;
    }
    if (is2FAEnabled) {
      disableTwoFAMutation.mutate(undefined, { onSuccess: reset2FAForm });
    } else {
      enableTwoFAMutation.mutate(undefined, { onSuccess: reset2FAForm });
    }
  };

  const handleConfirm2FA = () => {
    if (!twoFAPassword.trim()) {
      toast.error("Please enter your password to continue.");
      return;
    }
    const onComplete = { onSuccess: reset2FAForm };
    if (is2FAEnabled) {
      disableTwoFAMutation.mutate(twoFAPassword, onComplete);
    } else {
      enableTwoFAMutation.mutate(twoFAPassword, onComplete);
    }
  };

  const handleGoogleLinkSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error("Google sign-in failed. Please try again.");
      setShowGoogleLinkOverlay(false);
      return;
    }
    linkGoogleMutation.mutate(response.credential, {
      onSettled: () => setShowGoogleLinkOverlay(false),
    });
  };

  return (
    <SettingsPanel
      title="Sign-in & security"
      description="Two-factor authentication and connected accounts."
      className="h-full"
    >
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-[#0F2D29]/10 bg-[#F8F7F3]/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#0F2D29]/8 bg-white ${
                  is2FAEnabled ? "text-[#0F8A65]" : "text-[#8FA69E]"
                }`}
              >
                {is2FAEnabled ? (
                  <ShieldCheck size={16} />
                ) : (
                  <ShieldOff size={16} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#0F2D29]">
                  Two-factor authentication
                </p>
                <p className="text-[11.5px] text-[#5B6E68]">
                  Email OTP on every sign-in ·{" "}
                  {is2FAEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
            <SettingsButton
              className="h-9 shrink-0 px-3 text-[12px]"
              onClick={handleToggle2FA}
              disabled={is2FAPending || isUserLoading}
            >
              {is2FAEnabled ? "Disable" : "Enable"}
            </SettingsButton>
          </div>

          {show2FAPasswordForm && isLocalAccount && (
            <div className="mt-3 space-y-3 border-t border-[#0F2D29]/8 pt-3">
              <BasePasswordInput
                value={twoFAPassword}
                onChange={(e) => setTwoFAPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <div className="flex gap-2">
                <SettingsButton
                  className="h-9"
                  onClick={handleConfirm2FA}
                  disabled={is2FAPending}
                >
                  Confirm
                </SettingsButton>
                <SettingsButton
                  variant="ghost"
                  className="h-9"
                  onClick={reset2FAForm}
                >
                  Cancel
                </SettingsButton>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#0F2D29]/10 bg-[#F8F7F3]/50 p-4">
          <p className="text-[13px] font-semibold text-[#0F2D29]">
            Connected accounts
          </p>
          <p className="mt-0.5 text-[11.5px] text-[#5B6E68]">
            Link sign-in providers to your Gravity account.
          </p>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-[#0F2D29]/10 bg-white p-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#0F2D29]/8 bg-[#F8F7F3]">
                <GoogleIcon />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#0F2D29]">
                  Google
                </p>
                <p className="text-[11.5px] text-[#5B6E68]">
                  {isGoogleAccount
                    ? "Connected — use Google to sign in"
                    : "Link Google for faster sign-in"}
                </p>
              </div>
            </div>

            {isGoogleAccount ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#8FE3C4]/30 bg-[#8FE3C4]/15 px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide text-[#0F8A65]">
                <Check size={11} />
                Connected
              </span>
            ) : (
              <div className="relative h-10 shrink-0 min-w-[148px]">
                <SocialButton
                  icon={
                    linkGoogleMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Link2 size={14} />
                    )
                  }
                  label={
                    linkGoogleMutation.isPending ? "Linking..." : "Link Google"
                  }
                  onClick={() => setShowGoogleLinkOverlay(true)}
                  className="h-10 w-full px-3 text-[12px]"
                />
                {showGoogleLinkOverlay && (
                  <div className="absolute inset-0 overflow-hidden opacity-0 [&>div]:h-full [&>div]:w-full [&_iframe]:h-full! [&_iframe]:w-full!">
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
      </div>
    </SettingsPanel>
  );
}
