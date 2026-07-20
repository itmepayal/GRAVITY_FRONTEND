import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { BaseOtpInput } from "@/components/form/BaseOtpInput";
import { OrbitCard } from "./OrbitCard";

interface TwoFACardProps {
  email: string;
  length?: number;
  onVerify: (otp: string) => Promise<void> | void;
  onBack: () => void;
}

export function TwoFACard({
  email,
  length = 6,
  onVerify,
  onBack,
}: TwoFACardProps) {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < length) return;

    setOtpError("");
    setIsVerifyingOtp(true);
    try {
      await onVerify(otp);
    } catch (err) {
      setOtpError(
        err instanceof Error ? err.message : "Invalid code. Please try again.",
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleBack = () => {
    setOtp("");
    setOtpError("");
    onBack();
  };

  return (
    <AuthLayout
      title="Keep your whole team in orbit."
      description="Gravity pulls every task, deadline, and update into one shared field — so nothing drifts and nobody works alone."
      panelContent={<OrbitCard />}
    >
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h2 className="text-[#0F2D29] text-[26px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em]">
          Verify it's you
        </h2>
        <p className="text-[#5B6E68] text-[13.5px] max-w-75">
          We sent a {length}-digit code to{" "}
          {email && <span className="font-medium text-[#0F2D29]">{email}</span>}
        </p>
      </div>

      <form
        onSubmit={handleOtpSubmit}
        className="flex flex-col gap-5 w-full items-center"
      >
        <BaseOtpInput length={length} value={otp} onChange={setOtp} autoFocus />

        {otpError && (
          <p className="text-red-500 text-[12.5px] -mt-2">{otpError}</p>
        )}

        <Button
          type="submit"
          disabled={isVerifyingOtp || otp.length < length}
          className="group h-11 w-full rounded-xl font-semibold text-[14px] bg-[#0F2D29] text-white hover:bg-[#0F2D29]/90 transition-all disabled:opacity-70"
        >
          {isVerifyingOtp ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Verifying…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              Verify & Sign in
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          )}
        </Button>
      </form>

      <button
        type="button"
        onClick={handleBack}
        className="text-[#0F8A65] text-[12.5px] hover:text-[#0F8A65]/80 transition-colors self-center"
      >
        Back to login
      </button>
    </AuthLayout>
  );
}
