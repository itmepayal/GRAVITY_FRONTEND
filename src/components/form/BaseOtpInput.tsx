"use client";

import {
  forwardRef,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

interface BaseOtpInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  autoFocus?: boolean;
}

export const BaseOtpInput = forwardRef<HTMLDivElement, BaseOtpInputProps>(
  (
    {
      length = 6,
      value,
      onChange,
      onComplete,
      disabled,
      className,
      containerClassName,
      autoFocus = true,
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(
      value ?? ""
    );
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const otp = isControlled ? value! : internalValue;
    const digits = Array.from({ length }, (_, i) => otp[i] ?? "");

    const setOtp = (next: string) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
      if (next.length === length) onComplete?.(next);
    };

    const focusInput = (index: number) => {
      const el = inputsRef.current[index];
      el?.focus();
      el?.select();
    };

    const handleChange = (index: number, raw: string) => {
      const char = raw.replace(/[^0-9]/g, "").slice(-1);
      if (!char) {
        const next = otp.slice(0, index) + otp.slice(index + 1);
        setOtp(next);
        return;
      }

      const next =
        otp.slice(0, index).padEnd(index, " ").slice(0, index) +
        char +
        otp.slice(index + 1);
      setOtp(next.slice(0, length).replace(/ /g, ""));

      if (index < length - 1) {
        focusInput(index + 1);
      }
    };

    const handleKeyDown = (
      index: number,
      e: KeyboardEvent<HTMLInputElement>
    ) => {
      if (e.key === "Backspace") {
        if (digits[index]) {
          const next = otp.slice(0, index) + otp.slice(index + 1);
          setOtp(next);
        } else if (index > 0) {
          const next = otp.slice(0, index - 1) + otp.slice(index);
          setOtp(next);
          focusInput(index - 1);
        }
        e.preventDefault();
      } else if (e.key === "ArrowLeft" && index > 0) {
        focusInput(index - 1);
        e.preventDefault();
      } else if (e.key === "ArrowRight" && index < length - 1) {
        focusInput(index + 1);
        e.preventDefault();
      }
    };

    const handlePaste = (
      index: number,
      e: ClipboardEvent<HTMLInputElement>
    ) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/[^0-9]/g, "");
      if (!pasted) return;

      const next = (
        otp.slice(0, index) + pasted
      ).slice(0, length);
      setOtp(next);

      const focusIndex = Math.min(next.length, length - 1);
      focusInput(focusIndex);
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", containerClassName)}
      >
        {digits.map((digit, index) => {
          const isFocused = focusedIndex === index;
          return (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              disabled={disabled}
              autoFocus={autoFocus && index === 0}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
              onFocus={(e) => {
                setFocusedIndex(index);
                e.target.select();
              }}
              onBlur={() => setFocusedIndex(null)}
              className={cn(
                "h-12 w-11 rounded-[10px] bg-[#F4F8F6] border border-[#0F2D29]/10 text-center text-[16px] font-medium text-[#0F2D29]",
                "outline-none transition-colors",
                "focus-visible:ring-1 focus-visible:ring-[#8FE3C4] focus-visible:ring-offset-0 focus-visible:border-[#8FE3C4]",
                isFocused ? "border-[#8FE3C4]" : "border-[#0F2D29]/10",
                disabled && "opacity-50 cursor-not-allowed",
                className
              )}
            />
          );
        })}
      </div>
    );
  }
);

BaseOtpInput.displayName = "BaseOtpInput";
