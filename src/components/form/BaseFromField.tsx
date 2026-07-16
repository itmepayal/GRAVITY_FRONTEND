"use client";

import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const FormField = ({ label, htmlFor, action, children }: FormFieldProps)  => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={htmlFor}
          className="text-[#5B6E68] text-[12px] tracking-[0.02em] uppercase"
        >
          {label}
        </Label>
        {action}
      </div>
      {children}
    </div>
  );
}