import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Badge } from "../common/badge";
import { AUTOMATIONS } from "@/constants/automation";
import { Reveal } from "../common/reveal";
import { Switch } from "../common/switch";

export function Automation() {
  const [enabled, setEnabled] = useState<boolean[]>(
    AUTOMATIONS.map(() => true),
  );
  const toggle = (i: number) =>
    setEnabled((e) => e.map((v, idx) => (idx === i ? !v : v)));

  return (
    <section className="bg-[#0F2D29]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
       <div className="max-w-[1400px] mx-auto py-6 sm:py-8 md:py-9 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
        <Badge
          eyebrow="Automation"
          title="Rules that watch the schedule so no one has to"
          description="Write the coordination logic once. Waypoint runs it on every relevant change, forever."
          dark
        />
        <Reveal delay={100}>
          <div className="max-w-[640px] mx-auto flex flex-col gap-3">
            {AUTOMATIONS.map((rule, i) => {
              const Icon = rule.icon;
              const on = enabled[i];
              return (
                <div
                  key={rule.trigger}
                  className="flex items-center gap-4 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-xl px-4 sm:px-5 py-4 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#8FE3C4]/15 text-[#8FE3C4] flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] flex-1 min-w-0">
                    <span className="text-white font-medium">
                      {rule.trigger}
                    </span>
                    <ArrowRight size={12} className="text-[#B7CFC7] shrink-0" />
                    <span className="text-[#B7CFC7]">{rule.action}</span>
                  </div>
                  <Switch
                    on={on}
                    onToggle={() => toggle(i)}
                    label={`Toggle rule: ${rule.trigger}`}
                  />
                </div>
              );
            })}
            <button className="flex items-center justify-center gap-2 text-[12.5px] font-medium text-[#8FE3C4] border border-dashed border-[#8FE3C4]/30 rounded-xl py-3.5 mt-1 hover:bg-[#8FE3C4]/5 transition-colors">
              <Plus size={14} />
              Build a custom rule
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}