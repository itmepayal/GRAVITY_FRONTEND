import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { BaseOtpInput } from "@/components/form/BaseOtpInput";
import { useVerifyEmail } from "@/hooks/mutations/auth/use-verify-email";
import { useResendVerificationEmail } from "@/hooks/mutations/auth/use-reset-verify-email";
import { WhyWeAskCard } from "@/components/auth/verify-email/WhyWeAskCard";

const RESEND_SECONDS = 30;

const VerifyEmail = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const email =
    (location.state as { email?: string })?.email ||
    searchParams.get("email") ||
    "";

  const [code, setCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    mutate: verify,
    isPending: isVerifying,
    isSuccess,
  } = useVerifyEmail();
  const { mutate: resend, isPending: isResending } =
    useResendVerificationEmail();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6 || !email) return;
    verify({ email, otp: code });
  };

  const handleResend = () => {
    if (resendCooldown > 0 || !email) return;
    resend({ email });
    setResendCooldown(RESEND_SECONDS);
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  return (
    <AuthLayout
      title="Almost there — verify your email."
      description="A quick code keeps Gravity secure and makes sure updates land in the right inbox."
      panelContent={<WhyWeAskCard />}
    >
      {!isSuccess ? (
        <>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h2 className="text-[#0F2D29] text-[26px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em]">
              Enter your code
            </h2>
            <p className="text-[#5B6E68] text-[13.5px] max-w-75">
              We sent a 6-digit code to{" "}
              {email && (
                <span className="font-medium text-[#0F2D29]">{email}</span>
              )}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 w-full items-center"
          >
            <BaseOtpInput
              length={6}
              value={code}
              onChange={setCode}
              autoFocus
            />
            <Button
              type="submit"
              disabled={isVerifying || code.length < 6}
              className="group h-11 w-full rounded-xl font-semibold text-[14px] bg-[#0F2D29] text-white hover:bg-[#0F2D29]/90 transition-all disabled:opacity-70"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Verifying…
                </span>
              ) : (
                "Verify email"
              )}
            </Button>
          </form>

          <p className="text-[#5B6E68] text-[13px]">
            Didn't get a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className="text-[#0F8A65] font-medium hover:text-[#0F8A65]/80 transition-colors disabled:text-[#5B6E68]/60 disabled:cursor-not-allowed"
            >
              {isResending
                ? "Sending…"
                : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
            </button>
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center w-full">
          <div className="w-14 h-14 rounded-full bg-[#8FE3C4]/15 flex items-center justify-center">
            <MailCheck size={26} className="text-[#0F8A65]" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h2 className="text-[#0F2D29] text-[22px] font-bold leading-tight tracking-[-0.02em]">
              Email verified
            </h2>
            <p className="text-[#5B6E68] text-[13.5px] max-w-75">
              You're all set — your account is confirmed and ready to go.
            </p>
          </div>
        </div>
      )}
      <a
        href="/login"
        className="flex items-center gap-1.5 text-[#5B6E68] text-[13px] hover:text-[#0F2D29] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to sign in
      </a>
    </AuthLayout>
  );
};

export default VerifyEmail;
