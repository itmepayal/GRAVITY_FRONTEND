import { Loader2, ArrowRight, ArrowLeft, Mail, UserCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/BaseFromField";
import { BaseInput } from "@/components/form/BaseInput";
import { BasePasswordInput } from "@/components/form/BasePasswordInput";
import { OrbitCard } from "@/components/auth/login/OrbitCard";
import { useReactivateAccount } from "@/hooks/mutations/auth/use-reactivate-account";
import {
  reactivateAccountSchema,
  type ReactivateAccountFormData,
} from "@/validations/auth.validation";
import { toast } from "sonner";

type ReactivateAccountCardProps = {
  onBack: () => void;
};

export function ReactivateAccountCard({ onBack }: ReactivateAccountCardProps) {
  const { mutate, isPending } = useReactivateAccount({ redirectOnSuccess: false });

  const form = useForm<ReactivateAccountFormData>({
    resolver: zodResolver(reactivateAccountSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = (values: ReactivateAccountFormData) => {
    mutate(values, {
      onSuccess: () => {
        form.reset();
        onBack();
      },
    });
  };

  const onInvalid = (errors: typeof form.formState.errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  };

  return (
    <AuthLayout
      title="Welcome back to orbit."
      description="Reactivate your account with the same email and password you used before deactivation."
      panelContent={<OrbitCard />}
    >
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8FE3C4]/20 text-[#0F8A65]">
          <UserCheck size={20} />
        </div>
        <h2 className="text-[#0F2D29] text-[26px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em]">
          Reactivate account
        </h2>
        <p className="text-[#5B6E68] text-[13.5px] max-w-80">
          Enter the email and password for your deactivated account. This only
          works for email/password accounts.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
        className="flex flex-col gap-4 w-full"
      >
        <FormField label="Email" htmlFor="reactivate-email">
          <BaseInput
            id="reactivate-email"
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...form.register("email")}
          />
        </FormField>

        <FormField label="Password" htmlFor="reactivate-password">
          <BasePasswordInput
            id="reactivate-password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...form.register("password")}
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
              Reactivating…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              Reactivate account
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
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[#0F8A65] text-[12.5px] hover:text-[#0F8A65]/80 transition-colors self-center"
      >
        <ArrowLeft size={14} />
        Back to login
      </button>
    </AuthLayout>
  );
}
