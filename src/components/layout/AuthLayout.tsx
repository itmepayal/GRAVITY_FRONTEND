"use client";

import { AMBIENT_NODES } from "@/constants/loader";
import { GravityMarkLoader } from "@/components/common/logo";

interface AuthLayoutProps {
  title: string;
  description: string;
  panelContent?: React.ReactNode;
  children: React.ReactNode;
}

export const AuthLayout = ({
  title,
  description,
  panelContent,
  children,
}: AuthLayoutProps) => {
  return (
    <div className="fixed inset-0 z-50 flex bg-white">
      <div className="relative hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between overflow-hidden bg-[#0F2D29] px-12 py-10">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[28px_28px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-105 h-105 rounded-full opacity-20 blur-3xl bg-[radial-gradient(circle,#8FE3C4_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-95 h-95 rounded-full opacity-10 blur-3xl bg-[radial-gradient(circle,#E98A57_0%,transparent_70%)]" />
        {AMBIENT_NODES.map((n, i) => (
          <span
            key={i}
            className={`pointer-events-none absolute rounded-full opacity-35 animate-[node-drift_ease-in-out_infinite] ${
              i % 3 === 0 ? "bg-[#E98A57]" : "bg-[#8FE3C4]"
            }`}
            style={{
              left: n.x,
              top: n.y,
              width: n.size,
              height: n.size,
              animationDuration: n.dur,
              animationDelay: n.delay,
            }}
          />
        ))}

        <div className="relative z-10 flex items-center gap-2.5">
          <GravityMarkLoader step={1} />
          <span className="text-white text-[17px] font-semibold tracking-[-0.01em]">
            Gravity
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-8 max-w-105">
          <div className="flex flex-col gap-3">
            <h1 className="text-white text-[32px] xl:text-[36px] font-bold leading-[1.15] tracking-[-0.02em] [text-shadow:0_0_40px_#8FE3C433]">
              {title}
            </h1>
            <p className="text-[#B7CFC7] text-[14px] leading-relaxed">
              {description}
            </p>
          </div>

          {panelContent}
        </div>

        <p className="relative z-10 text-[#B7CFC7]/60 text-[12px]">
          © {new Date().getFullYear()} Gravity. All rights reserved.
        </p>
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center bg-white px-6">
        <div className="flex flex-col items-center gap-6 w-full max-w-95 animate-[fade-in_0.5s_ease-out]">
          <div className="flex lg:hidden items-center gap-2.5">
            <GravityMarkLoader step={1} />
            <span className="text-[#0F2D29] text-[17px] font-semibold">
              Gravity
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
