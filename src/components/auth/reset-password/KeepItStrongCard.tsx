import { TIPS } from "@/constants/auth";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export const KeepItStrongCard = () => {
  return (
    <div className="relative rounded-[16px] border border-white/8 bg-white/4 backdrop-blur-sm p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[#B7CFC7]">
          Keep it strong
        </span>
        <ShieldCheck size={14} className="text-[#8FE3C4]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {TIPS.map((tip) => (
          <div key={tip} className="flex items-center gap-2.5">
            <CheckCircle2 size={15} className="text-[#8FE3C4]" />
            <span className="text-[13px] text-white/85">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
