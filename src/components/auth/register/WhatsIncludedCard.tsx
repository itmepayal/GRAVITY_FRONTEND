import { INCLUDED_ITEMS } from "@/constants/auth";
import { Sparkles } from "lucide-react";

export const WhatsIncludedCard = () => {
  return (
    <div className="relative rounded-[16px] border border-white/8 bg-white/4 backdrop-blur-sm p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[#B7CFC7]">
          What's included
        </span>
        <Sparkles size={14} className="text-[#8FE3C4]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {INCLUDED_ITEMS.map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8FE3C4] shrink-0" />
            <span className="text-[13px] text-white/85">{item}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-1.5">
        <div className="flex -space-x-2">
          {["#8FE3C4", "#E98A57", "#B7CFC7"].map((c) => (
            <div
              key={c}
              className="w-6 h-6 rounded-full border-2 border-[#0F2D29]"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <span className="text-[11.5px] text-[#B7CFC7] ml-1">
          Join 12,000+ teams already in orbit
        </span>
      </div>
    </div>
  );
};
