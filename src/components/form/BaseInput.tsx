"use client";

import { forwardRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BaseInputProps extends React.ComponentProps<typeof Input> {
  icon: LucideIcon;
  rightElement?: React.ReactNode;
}

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  ({ icon: Icon, rightElement, className, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    return (
      <div className="relative">
        <Icon
          size={16}
          className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none",
            focused ? "text-[#0F2D29]" : "text-[#0F2D29]/30"
          )}
        />
        <Input
          ref={ref}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            "h-11 rounded-[10px] bg-[#F4F8F6] border-[#0F2D29]/10 text-[#0F2D29] placeholder:text-[#0F2D29]/30 pl-10 text-[14px]",
            rightElement && "pr-10",
            "transition-colors focus-visible:ring-1 focus-visible:ring-[#8FE3C4] focus-visible:ring-offset-0 focus-visible:border-[#8FE3C4]",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

BaseInput.displayName = "BaseInput";
