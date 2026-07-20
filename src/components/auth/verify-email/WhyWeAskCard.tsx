import { REASONS } from "@/constants/auth";
import { ShieldCheck } from "lucide-react";

export const WhyWeAskCard = () => {
  return (
    <div className="relative rounded-[16px] border border-white/8 bg-white/4 backdrop-blur-sm p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[#B7CFC7]">
          Why we ask
        </span>
        <ShieldCheck size={14} className="text-[#8FE3C4]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {REASONS.map((reason) => (
          <div key={reason} className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8FE3C4] shrink-0" />
            <span className="text-[13px] text-white/85">{reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
