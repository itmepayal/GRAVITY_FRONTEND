"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { BaseInput } from "@/components/form/BaseInput";

type BasePasswordInputProps = Omit<
  React.ComponentProps<typeof BaseInput>,
  "icon" | "type" | "rightElement"
>;

export function BasePasswordInput(props: BasePasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <BaseInput
      icon={Lock}
      type={show ? "text" : "password"}
      rightElement={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="text-[#0F2D29]/40 hover:text-[#0F2D29]/70 transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
      {...props}
    />
  );
}
