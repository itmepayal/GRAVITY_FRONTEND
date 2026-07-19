"use client";

import { toast } from "sonner";
import { useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/form/BaseFromField";
import { BaseInput } from "@/components/form/BaseInput";
import { BasePasswordInput } from "@/components/form/BasePasswordInput";
import { TIPS } from "@/constants/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "@/hooks/mutations/auth/use-reset-password";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/validations/auth.validation";

const KeepItStrongCard = () => {
  return (
    <div className="relative rounded-[16px] border border-white/8 bg-white/4 backdrop-blur-sm p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[#B7CFC7]">
          Keep it strong
        </span>
        <ShieldCheck size={14} className="text-[#8FE3C4]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {TIPS.map((tip) => (
          <div key={tip} className="flex items-center gap-2.5">
            <CheckCircle2 size={15} className="text-[#8FE3C4]" />
            <span className="text-[13px] text-white/85">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResetPassword = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const email =
    (location.state as { email?: string; otp?: string })?.email ||
    searchParams.get("email") ||
    "";
  const otp =
    (location.state as { email?: string; otp?: string })?.otp ||
    searchParams.get("otp") ||
    "";

  const { mutate, isPending, isSuccess } = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      otp,
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = (values: ResetPasswordFormData) => {
    const { confirmPassword, ...payload } = values;
    mutate(payload);
  };

  const onInvalid = (errors: typeof form.formState.errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  };

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <AuthLayout
      title="One new password, and you're back in orbit."
      description="Choose a fresh password for your account. You'll be signed out everywhere else once it's set."
      panelContent={<KeepItStrongCard />}
    >
      {!isSuccess ? (
        <>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h2 className="text-[#0F2D29] text-[26px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em]">
              Set a new password
            </h2>
            <p className="text-[#5B6E68] text-[13.5px] max-w-75">
              {email ? (
                <>
                  Enter the code sent to{" "}
                  <span className="font-medium text-[#0F2D29]">{email}</span>{" "}
                  and choose a new password.
                </>
              ) : (
                "Make it something you haven't used before on Gravity."
              )}
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
            className="flex flex-col gap-4 w-full"
          >
            <FormField label="Verification code" htmlFor="otp">
              <BaseInput
                icon={KeyRound}
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                maxLength={6}
                autoFocus
                {...form.register("otp")}
              />
            </FormField>

            <FormField label="New password" htmlFor="password">
              <BasePasswordInput
                id="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                {...form.register("password")}
              />
            </FormField>

            <FormField label="Confirm new password" htmlFor="confirmPassword">
              <BasePasswordInput
                id="confirmPassword"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
            </FormField>

            {mismatch && (
              <p className="text-[#E98A57] text-[12.5px] -mt-2">
                Passwords don't match yet.
              </p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="group h-11 rounded-xl mt-1 font-semibold text-[14px] bg-[#0F2D29] text-white hover:bg-[#0F2D29]/90 transition-all disabled:opacity-70"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Resetting…
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Reset password
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              )}
            </Button>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center w-full">
          <div className="w-14 h-14 rounded-full bg-[#8FE3C4]/15 flex items-center justify-center">
            <CheckCircle2 size={26} className="text-[#0F8A65]" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h2 className="text-[#0F2D29] text-[22px] font-bold leading-tight tracking-[-0.02em]">
              Password reset
            </h2>
            <p className="text-[#5B6E68] text-[13.5px] max-w-75">
              Your password has been updated. Sign in with your new password to
              continue.
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

export default ResetPassword;
