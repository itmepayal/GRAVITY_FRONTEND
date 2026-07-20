import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BaseInput } from "@/components/form/BaseInput";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/form/BaseFromField";
import { Mail, Loader2, ArrowRight, ArrowLeft, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@/hooks/mutations/auth/use-forgot-password";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/validations/auth.validation";
import { HowItWorksCard } from "@/components/auth/forgot-password/HowItWorksCard";

const ForgotPassword = () => {
  const { mutate, isPending, isSuccess, reset } = useForgotPassword();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = (values: ForgotPasswordFormData) => {
    mutate(values);
  };

  const onInvalid = (errors: typeof form.formState.errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  };

  const submittedEmail = form.getValues("email");

  const handleTryAnotherEmail = () => {
    reset();
    form.reset();
  };

  return (
    <AuthLayout
      title="Losing a password doesn't mean losing orbit."
      description="Confirm it's you, and we'll get you a fresh link to set a new password in seconds."
      panelContent={<HowItWorksCard />}
    >
      {!isSuccess ? (
        <>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h2 className="text-[#0F2D29] text-[26px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em]">
              Forgot your password?
            </h2>
            <p className="text-[#5B6E68] text-[13.5px] max-w-75">
              No worries — enter the email tied to your account and we'll send
              you a reset link.
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
            className="flex flex-col gap-4 w-full"
          >
            <FormField label="Email" htmlFor="email">
              <BaseInput
                icon={Mail}
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...form.register("email")}
              />
            </FormField>

            <Button
              type="submit"
              disabled={isPending}
              className="group h-11 rounded-xl mt-1 font-semibold text-[14px] bg-[#0F2D29] text-white hover:bg-[#0F2D29]/90 transition-all disabled:opacity-70"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Sending link…
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Send reset link
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
            <MailCheck size={26} className="text-[#0F8A65]" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h2 className="text-[#0F2D29] text-[22px] font-bold leading-tight tracking-[-0.02em]">
              Check your inbox
            </h2>
            <p className="text-[#5B6E68] text-[13.5px] max-w-75">
              We've sent a reset link to{" "}
              <span className="text-[#0F2D29] font-medium">
                {submittedEmail}
              </span>
              . It'll expire in 10 minutes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTryAnotherEmail}
            className="text-[#0F8A65] text-[13px] font-medium hover:text-[#0F8A65]/80 transition-colors mt-1"
          >
            Didn't get it? Try another email
          </button>
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

export default ForgotPassword;
