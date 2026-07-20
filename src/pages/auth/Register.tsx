import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Loader2, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/form/BaseFromField";
import { BaseInput } from "@/components/form/BaseInput";
import { BasePasswordInput } from "@/components/form/BasePasswordInput";
import { GoogleIcon, SocialButton } from "@/components/button/SocialButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/hooks/mutations/auth/use-register";
import {
  registerSchema,
  type RegisterFormData,
} from "@/validations/auth.validation";
import { WhatsIncludedCard } from "@/components/auth/register/WhatsIncludedCard";

const Register = () => {
  const { mutate, isPending } = useRegister();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const handleSubmit = (values: RegisterFormData) => {
    mutate(
      {
        name: values.name,
        email: values.email,
        password: values.password,
      },
      {
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong. Please try again.",
          );
        },
      },
    );
  };

  const onInvalid = (errors: typeof form.formState.errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  };

  return (
    <AuthLayout
      title="Give your team something to orbit around."
      description="Set up your workspace in under a minute — projects, teammates, and deadlines, all pulled into one shared field."
      panelContent={<WhatsIncludedCard />}
    >
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h2 className="text-[#0F2D29] text-[26px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em]">
          Create your account
        </h2>
        <p className="text-[#5B6E68] text-[13.5px]">
          Start free — no credit card needed.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
        className="flex flex-col gap-4 w-full"
      >
        <FormField label="Full name" htmlFor="name">
          <BaseInput
            icon={User}
            id="name"
            type="text"
            placeholder="Ada Lovelace"
            autoComplete="name"
            {...form.register("name")}
          />
        </FormField>

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

        <FormField label="Password" htmlFor="password">
          <BasePasswordInput
            id="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            {...form.register("password")}
          />
        </FormField>

        <FormField label="Confirm password" htmlFor="confirmPassword">
          <BasePasswordInput
            id="confirmPassword"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            minLength={8}
            {...form.register("confirmPassword")}
          />
        </FormField>

        <div className="flex items-start gap-2 mt-1">
          <Checkbox
            id="terms"
            onCheckedChange={(checked) =>
              form.setValue("terms", checked === true)
            }
            className="mt-0.5 border-[#0F2D29]/20 data-[state=checked]:bg-[#8FE3C4] data-[state=checked]:border-[#8FE3C4] data-[state=checked]:text-[#0F2D29]"
          />
          <Label
            htmlFor="terms"
            className="text-[#5B6E68] text-[12.5px] font-normal cursor-pointer leading-snug"
          >
            I agree to the{" "}
            <a
              href="/terms"
              className="text-[#0F8A65] hover:text-[#0F8A65]/80 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-[#0F8A65] hover:text-[#0F8A65]/80 transition-colors"
            >
              Privacy Policy
            </a>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="group h-11 rounded-xl mt-1 font-semibold text-[14px] bg-[#0F2D29] text-white hover:bg-[#0F2D29]/90 transition-all disabled:opacity-70"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Creating account…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              Create account
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          )}
        </Button>
      </form>

      <div className="flex items-center gap-3 w-full">
        <div className="h-px flex-1 bg-[#0F2D29]/10" />
        <span className="text-[#5B6E68]/70 text-[11.5px] uppercase tracking-[0.04em]">
          or continue with
        </span>
        <div className="h-px flex-1 bg-[#0F2D29]/10" />
      </div>

      <div className="grid grid-cols-1 gap-3 w-full">
        <SocialButton icon={<GoogleIcon />} label="Google" />
      </div>

      <p className="text-[#5B6E68] text-[13px]">
        Already have an account?{" "}
        <a
          href="/login"
          className="text-[#0F8A65] font-medium hover:text-[#0F8A65]/80 transition-colors"
        >
          Sign in
        </a>
      </p>
    </AuthLayout>
  );
};

export default Register;
