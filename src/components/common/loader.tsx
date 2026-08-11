import { useEffect, useState } from "react";
import { AMBIENT_NODES } from "@/constants/loader";
import type { LoaderProps } from "@/types";
import { GravityBrand, GravityMarkLoader } from "@/components/common/logo";

export const Loader = ({
  progress,
  label = "Loading Task Management Workspace",
}: LoaderProps) => {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState("");
  const indeterminate = progress === undefined;

  useEffect(() => {
    if (!indeterminate) return;
    const t = window.setInterval(() => {
      setStep((s) => (s >= 4 ? 0 : s + 1));
    }, 550);
    return () => window.clearInterval(t);
  }, [indeterminate]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 450);
    return () => window.clearInterval(t);
  }, []);

  const barWidth = indeterminate
    ? undefined
    : Math.max(0, Math.min(100, progress));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0F2D29]"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.06)_1px,_transparent_0)] bg-[length:28px_28px] opacity-50" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,_#8FE3C4_0%,_transparent_70%)] opacity-20 blur-3xl sm:-top-40 sm:-right-40 sm:h-[520px] sm:w-[520px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,_#E98A57_0%,_transparent_70%)] opacity-10 blur-3xl sm:-bottom-40 sm:-left-40 sm:h-[420px] sm:w-[420px]" />

      {AMBIENT_NODES.map((n, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute animate-[node-drift_ease-in-out_infinite] rounded-full opacity-35 ${
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

      <div className="relative flex flex-col items-center gap-8 px-6 text-center">
        <GravityMarkLoader step={step} />

        <div className="flex flex-col items-center gap-3">
          <GravityBrand size={32} showTag />
          <span className="flex items-center text-[12px] font-medium tracking-[0.02em] text-[#B7CFC7] sm:text-[12.5px]">
            {label}
            <span className="inline-block w-[1.2em] text-left">{dots}</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="relative h-[4px] w-[190px] overflow-hidden bg-white/[0.07] shadow-[0_0_12px_#8FE3C41A] sm:w-[230px]">
            {indeterminate ? (
              <div className="absolute inset-y-0 w-2/5 animate-[loader-sweep_1.5s_ease-in-out_infinite] bg-[linear-gradient(90deg,_transparent,_#8FE3C4,_#3FA787,_transparent)]" />
            ) : (
              <div
                className="h-full bg-[linear-gradient(90deg,_#3FA787,_#8FE3C4)] shadow-[0_0_8px_#8FE3C488] transition-[width] duration-300 ease-out"
                style={{ width: `${barWidth}%` }}
              />
            )}
          </div>
          {!indeterminate && (
            <span className="text-[10.5px] font-medium tracking-[0.02em] text-[#3FA787] tabular-nums">
              {Math.round(barWidth ?? 0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
