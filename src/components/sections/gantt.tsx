import { useState } from "react";
import { Reveal } from "@/components/common/reveal";
import { Badge } from "@/components/common/badge";
import { GANTT_ROWS } from "@/constants/gantt";

export const GanttChart = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <section id="graph" className="bg-[#FBF3E6]">
      <div className=" max-w-[1400px] mx-auto py-6 sm:py-8 md:py-9 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
                <Badge
          eyebrow="Scheduling"
          title="One schedule, resequenced automatically"
          description="Drag a task and everything downstream of it moves with it. The critical path — the chain that actually controls your ship date — stays highlighted at all times."
        />
        <Reveal delay={100}>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#0F2D29]/8 p-3.5 sm:p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-5 px-1">
              <span className="text-[11px] sm:text-[12px] font-semibold text-[#0F2D29] tracking-wide">
                LAUNCH-V2.3 · 6 WEEKS
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:gap-4 text-[10px] sm:text-[11px] text-[#5E6D68]">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-1.5 rounded-full bg-[#3FA787] shrink-0" />
                  Critical path
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-1.5 rounded-full bg-[#B7CFC7] shrink-0" />
                  Buffered
                </div>
              </div>
            </div>
            <div className="-mx-3.5 sm:mx-0 px-3.5 sm:px-0 overflow-x-auto">
              <div className="min-w-[420px] sm:min-w-[520px] lg:min-w-0">
                {GANTT_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 group"
                    onMouseEnter={() => setHovered(row.label)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="w-[110px] sm:w-[150px] md:w-[180px] shrink-0">
                      <div className="text-[11px] sm:text-[12.5px] font-medium text-[#0F2D29] truncate">
                        {row.label}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-[#5E6D68]">{row.owner}</div>
                    </div>
                    <div className="relative flex-1 h-5 sm:h-6 bg-[#F2EADA] rounded-md">
                      <div
                        className={`absolute top-0.5 bottom-0.5 rounded-md transition-all duration-200 ${
                          row.critical ? "shadow-[0_0_0_1px_rgba(63,167,135,0.4)]" : ""
                        }`}
                        style={{
                          left: `${row.start}%`,
                          width: `${row.width}%`,
                          background: row.critical ? row.color : `${row.color}55`,
                          transform: hovered === row.label ? "scaleY(1.15)" : "scaleY(1)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
