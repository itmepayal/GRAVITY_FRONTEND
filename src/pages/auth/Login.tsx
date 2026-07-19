"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Loader2, ArrowRight, Orbit, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/form/BaseFromField";
import { BaseInput } from "@/components/form/BaseInput";
import { BasePasswordInput } from "@/components/form/BasePasswordInput";
import { GoogleIcon, SocialButton } from "@/components/button/SocialButton";
import { WEEKLY_TASKS } from "@/constants/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/mutations/auth/use-login";
import { loginSchema, type LoginFormData } from "@/validations/auth.validation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useGoogleLogin } from "@/hooks/mutations/auth/use-google-login.ts";

const OrbitCard = () => {
  return (
    <div className="relative rounded-[16px] border border-white/8 bg-white/4 backdrop-blur-sm p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[#B7CFC7]">
          This week's orbit
        </span>
        <Orbit size={14} className="text-[#8FE3C4]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {WEEKLY_TASKS.map((task) => (
          <div key={task.label} className="flex items-center gap-2.5">
            <CheckCircle2
              size={15}
              className={task.done ? "text-[#8FE3C4]" : "text-white/20"}
            />
            <span
              className={cn(
                "text-[13px]",
                task.done ? "text-white/50 line-through" : "text-white/85",
              )}
            >
              {task.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-1.5">
        <div className="flex -space-x-2">
          {["#8FE3C4", "#E98A57", "#B7CFC7"].map((c) => (
            <div
              key={c}
              className="w-6 h-6 rounded-full border-2 border-[#0F2D29]"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <span className="text-[11.5px] text-[#B7CFC7] ml-1">
          6 teammates active now
        </span>
      </div>
    </div>
  );
};

const Login = () => {
  const { mutate, isPending } = useLogin();
  const { mutate: googleMutate, isPending: isGooglePending } = useGoogleLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const handleSubmit = (values: LoginFormData) => {
    mutate(values);
  };

  const onInvalid = (errors: typeof form.formState.errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  };

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    googleMutate(credentialResponse.credential);
  };

  const handleGoogleError = () => {
    toast.error("Google sign-in failed. Please try again.");
  };

  const isBusy = isPending || isGooglePending;

  return (
    <AuthLayout
      title="Keep your whole team in orbit."
      description="Gravity pulls every task, deadline, and update into one shared field — so nothing drifts and nobody works alone."
      panelContent={<OrbitCard />}
    >
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h2 className="text-[#0F2D29] text-[26px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em]">
          Welcome back
        </h2>
        <p className="text-[#5B6E68] text-[13.5px]">
          Sign in to pick up right where you left orbit.
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

        <FormField
          label="Password"
          htmlFor="password"
          action={
            <a
              href="/forgot-password"
              className="text-[#0F8A65] text-[12px] hover:text-[#0F8A65]/80 transition-colors"
            >
              Forgot Password?
            </a>
          }
        >
          <BasePasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...form.register("password")}
          />
        </FormField>

        <div className="flex items-center gap-2 mt-1">
          <Checkbox
            id="remember"
            onCheckedChange={(checked) =>
              form.setValue("remember", checked === true)
            }
            className="border-[#0F2D29]/20 data-[state=checked]:bg-[#8FE3C4] data-[state=checked]:border-[#8FE3C4] data-[state=checked]:text-[#0F2D29]"
          />
          <Label
            htmlFor="remember"
            className="text-[#5B6E68] text-[12.5px] font-normal cursor-pointer"
          >
            Keep me signed in
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isBusy}
          className="group h-11 rounded-xl mt-1 font-semibold text-[14px] bg-[#0F2D29] text-white hover:bg-[#0F2D29]/90 transition-all disabled:opacity-70"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Signing in…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              Sign in
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          )}
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-3 w-full">
        <div className="relative h-11">
          <SocialButton
            icon={
              isGooglePending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <GoogleIcon />
              )
            }
            label={isGooglePending ? "Signing in…" : "Google"}
            className="w-full"
          />
          <div className="absolute inset-0 opacity-0 [&>div]:h-full [&>div]:w-full [&_iframe]:h-full! [&_iframe]:w-full! overflow-hidden">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              width="100%"
              text="continue_with"
            />
          </div>
        </div>
      </div>

      <p className="text-[#5B6E68] text-[13px]">
        New to Gravity?{" "}
        <a
          href="/register"
          className="text-[#0F8A65] font-medium hover:text-[#0F8A65]/80 transition-colors"
        >
          Create an account
        </a>
      </p>
    </AuthLayout>
  );
};

export default Login;
