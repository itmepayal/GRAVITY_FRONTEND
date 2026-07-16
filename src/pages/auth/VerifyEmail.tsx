"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { REASONS } from "@/constants/auth";
import { BaseOtpInput } from "@/components/form/BaseOtpInput";

const WhyWeAskCard = () => {
  return (
    <div className="relative rounded-[16px] border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[#B7CFC7]">
          Why we ask
        </span>
        <ShieldCheck size={14} className="text-[#8FE3C4]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {REASONS.map((reason) => (
          <div key={reason} className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8FE3C4] shrink-0" />
            <span className="text-[13px] text-white/85">{reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const RESEND_SECONDS = 30;

const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
    }, 1200);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(RESEND_SECONDS);
    const timer = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  return (
    <AuthLayout
      title="Almost there — verify your email."
      description="A quick code keeps Gravity secure and makes sure updates land in the right inbox."
      panelContent={<WhyWeAskCard />}
    >
      {!verified ? (
        <>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h2 className="text-[#0F2D29] text-[26px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em]">
              Enter your code
            </h2>
            <p className="text-[#5B6E68] text-[13.5px] max-w-[300px]">
              We sent a 6-digit code to{" "}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full items-center">
            <BaseOtpInput length={6} value={code} onChange={setCode} autoFocus />
            <Button
              type="submit"
              disabled={loading || code.length < 6}
              className="group h-11 w-full rounded-xl font-semibold text-[14px] bg-[#0F2D29] text-white hover:bg-[#0F2D29]/90 transition-all disabled:opacity-70"
            >
              {loading ? (
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
              disabled={resendCooldown > 0}
              className="text-[#0F8A65] font-medium hover:text-[#0F8A65]/80 transition-colors disabled:text-[#5B6E68]/60 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
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
            <p className="text-[#5B6E68] text-[13.5px] max-w-[300px]">
              You're all set — your account is confirmed and ready to go.
            </p>
          </div>

          <Button
            className="group h-11 w-full rounded-xl mt-1 font-semibold text-[14px] bg-[#0F2D29] text-white hover:bg-[#0F2D29]/90 transition-all"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Continue to sign in
          </Button>
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
}

export default VerifyEmail
