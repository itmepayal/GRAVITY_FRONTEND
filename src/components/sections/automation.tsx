import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Badge } from "@/components/common/badge";
import { AUTOMATIONS } from "@/constants/automation";
import { Reveal } from "@/components/common/reveal";
import { Switch } from "@/components/common/switch";

export function Automation() {
  const [enabled, setEnabled] = useState<boolean[]>(
    AUTOMATIONS.map(() => true),
  );
  const toggle = (i: number) =>
    setEnabled((e) => e.map((v, idx) => (idx === i ? !v : v)));

  return (
    <section className="bg-[#0F2D29] text-white relative overflow-hidden" id="solutions">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="max-w-[1400px] mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <Badge
          eyebrow="Workflow Automation Engine"
          title="Zero-Code Automation Rules that Run 24/7"
          description="Define task coordination triggers once. Gravity TMS executes them automatically across every workspace and sprint."
          dark
        />
        <Reveal delay={100}>
          <div className="max-w-[720px] mx-auto flex flex-col gap-3.5">
            {AUTOMATIONS.map((rule, i) => {
              const Icon = rule.icon;
              const on = enabled[i];
              return (
                <div
                  key={rule.trigger}
                  className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/12 p-4 transition-colors"
                >
                  <div className="w-10 h-10 border border-[#8FE3C4]/30 bg-[#8FE3C4]/15 text-[#8FE3C4] flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] flex-1 min-w-0">
                    <span className="text-white font-bold">
                      {rule.trigger}
                    </span>
                    <ArrowRight size={13} className="text-[#8FE3C4] shrink-0" />
                    <span className="text-[#B7CFC7] font-medium">{rule.action}</span>
                  </div>
                  <Switch
                    on={on}
                    onToggle={() => toggle(i)}
                    label={`Toggle rule: ${rule.trigger}`}
                  />
                </div>
              );
            })}
            <button className="flex items-center justify-center gap-2 text-[13px] font-bold text-[#8FE3C4] border border-dashed border-[#8FE3C4]/40 py-3.5 mt-2 hover:bg-[#8FE3C4]/10 transition-colors">
              <Plus size={15} strokeWidth={2.5} />
              Build a custom automation trigger
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}