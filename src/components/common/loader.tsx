import { useEffect, useState } from "react";
import { AMBIENT_NODES } from "@/constants/loader";
import type { LoaderProps } from "@/types";
import { GravityMarkLoader } from "@/components/common/logo";

export default function Loader({ progress, label = "Loading your schedule" }: LoaderProps) {
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

  const barWidth = indeterminate ? undefined : Math.max(0, Math.min(100, progress));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0F2D29]"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[length:28px_28px]" />
      <div className="pointer-events-none absolute -top-24 -right-24 sm:-top-40 sm:-right-40 w-[320px] h-[320px] sm:w-[520px] sm:h-[520px] rounded-full opacity-20 blur-3xl bg-[radial-gradient(circle,_#8FE3C4_0%,_transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 sm:-bottom-40 sm:-left-40 w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] rounded-full opacity-10 blur-3xl bg-[radial-gradient(circle,_#E98A57_0%,_transparent_70%)]" />
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

      <div className="relative flex flex-col items-center gap-7 px-6 text-center">
        <GravityMarkLoader step={step} />
        <div className="flex flex-col items-center gap-2">
          <span className="text-white text-[19px] sm:text-[21px] font-semibold font-['Poppins',sans-serif] tracking-[-0.01em] [text-shadow:0_0_24px_#8FE3C422]">
            Gravity
          </span>
          <span className="text-[12px] sm:text-[12.5px] flex items-center text-[#B7CFC7] font-['JetBrains_Mono','Poppins',monospace] font-medium tracking-[0.02em]">
            {label}
            <span className="inline-block w-[1.2em] text-left">{dots}</span>
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-[190px] sm:w-[230px] h-[4px] rounded-full bg-white/[0.07] overflow-hidden relative shadow-[0_0_12px_#8FE3C41A]">
            {indeterminate ? (
              <div
                className="absolute inset-y-0 rounded-full w-2/5 animate-[loader-sweep_1.5s_ease-in-out_infinite] bg-[linear-gradient(90deg,_transparent,_#8FE3C4,_#3FA787,_transparent)]"
              />
            ) : (
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-out bg-[linear-gradient(90deg,_#3FA787,_#8FE3C4)] shadow-[0_0_8px_#8FE3C488]"
                style={{ width: `${barWidth}%` }}
              />
            )}
          </div>
          {!indeterminate && (
            <span className="text-[10.5px] tabular-nums text-[#3FA787] font-['JetBrains_Mono','Poppins',monospace] font-medium tracking-[0.02em]">
              {Math.round(barWidth ?? 0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
