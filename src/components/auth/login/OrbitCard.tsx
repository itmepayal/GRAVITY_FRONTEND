import { Orbit, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WEEKLY_TASKS } from "@/constants/auth";

export const OrbitCard = () => {
  return (
    <div className="relative rounded-[16px] border border-white/8 bg-white/4 backdrop-blur-sm p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[#B7CFC7]">
          This week's orbit
        </span>
        <Orbit size={14} className="text-[#8FE3C4]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {WEEKLY_TASKS.map((task) => (
          <div key={task.label} className="flex items-center gap-2.5">
            <CheckCircle2
              size={15}
              className={task.done ? "text-[#8FE3C4]" : "text-white/20"}
            />
            <span
              className={cn(
                "text-[13px]",
                task.done ? "text-white/50 line-through" : "text-white/85",
              )}
            >
              {task.label}
            </span>
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
          6 teammates active now
        </span>
      </div>
    </div>
  );
};
