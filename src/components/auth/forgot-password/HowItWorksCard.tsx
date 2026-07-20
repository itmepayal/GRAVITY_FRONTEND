import { STEPS } from "@/constants/auth";
import { KeyRound } from "lucide-react";

export const HowItWorksCard = () => {
  return (
    <div className="relative rounded-[16px] border border-white/8 bg-white/4 backdrop-blur-sm p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[#B7CFC7]">
          How it works
        </span>
        <KeyRound size={14} className="text-[#8FE3C4]" />
      </div>
      <div className="flex flex-col gap-3">
        {STEPS.map((s) => (
          <div key={s.step} className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-[#8FE3C4] w-5 shrink-0">
              {s.step}
            </span>
            <span className="text-[13px] text-white/85">{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
