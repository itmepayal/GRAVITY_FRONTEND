"use client";

import { useState } from "react";
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

const OrbitCard = () => {
  return (
    <div className="relative rounded-[16px] border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[#B7CFC7]">
          This week's orbit
        </span>
        <Orbit size={14} className="text-[#8FE3C4]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {WEEKLY_TASKS.map((task) => (
          <div key={task.label} className="flex items-center gap-2.5">
            <CheckCircle2 size={15} className={task.done ? "text-[#8FE3C4]" : "text-white/20"} />
            <span className={cn("text-[13px]", task.done ? "text-white/50 line-through" : "text-white/85")}>
              {task.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center gap-1.5">
        <div className="flex -space-x-2">
          {["#8FE3C4", "#E98A57", "#B7CFC7"].map((c) => (
            <div key={c} className="w-6 h-6 rounded-full border-2 border-[#0F2D29]" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span className="text-[11.5px] text-[#B7CFC7] ml-1">6 teammates active now</span>
      </div>
    </div>
  );
}

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

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
        <p className="text-[#5B6E68] text-[13.5px]">Sign in to pick up right where you left orbit.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <FormField label="Email" htmlFor="email">
          <BaseInput
            icon={Mail}
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          action={
            <a href="/forgot-password" className="text-[#0F8A65] text-[12px] hover:text-[#0F8A65]/80 transition-colors">
              Forgot Password?
            </a>
          }
        >
          <BasePasswordInput id="password" placeholder="••••••••" autoComplete="current-password" required />
        </FormField>

        <div className="flex items-center gap-2 mt-1">
          <Checkbox
            id="remember"
            className="border-[#0F2D29]/20 data-[state=checked]:bg-[#8FE3C4] data-[state=checked]:border-[#8FE3C4] data-[state=checked]:text-[#0F2D29]"
          />
          <Label htmlFor="remember" className="text-[#5B6E68] text-[12.5px] font-normal cursor-pointer">
            Keep me signed in
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="group h-11 rounded-xl mt-1 font-semibold text-[14px] bg-[#0F2D29] text-white hover:bg-[#0F2D29]/90 transition-all disabled:opacity-70"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Signing in…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              Sign in
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-3 w-full">
        <SocialButton icon={<GoogleIcon />} label="Google" />
      </div>

      <p className="text-[#5B6E68] text-[13px]">
        New to Gravity?{" "}
        <a href="/register" className="text-[#0F8A65] font-medium hover:text-[#0F8A65]/80 transition-colors">
          Create an account
        </a>
      </p>
    </AuthLayout>
  );
}

export default Login