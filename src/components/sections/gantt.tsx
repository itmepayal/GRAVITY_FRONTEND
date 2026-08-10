import { useState } from "react";
import { Reveal } from "@/components/common/reveal";
import { Badge } from "@/components/common/badge";
import { GANTT_ROWS } from "@/constants/gantt";

export const GanttChart = () => {
  const [active, setActive] = useState<string | null>(null);

  const toggleActive = (label: string) =>
    setActive((current) => (current === label ? null : label));

  return (
    <section id="templates" className="bg-[#F8F7F3] border-b border-[#0F2D29]/10">
      <div className="max-w-[1400px] mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <Badge
          eyebrow="Interactive Gantt Timeline"
          title="Adaptive Schedule Control & Critical Path Highlight"
          description="Drag any task milestone and every dependent task downstream recalculates automatically. Critical path dependencies stay highlighted in real-time."
        />
        <Reveal delay={100}>
          <div className="bg-white border border-[#0F2D29]/12 p-4 sm:p-6 lg:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-3 border-b border-[#0F2D29]/10">
              <span className="text-[12px] font-extrabold text-[#0F2D29] tracking-wider uppercase bg-[#0F2D29]/5 px-3 py-1 border border-[#0F2D29]/10">
                SPRINT-14 RELEASE ROADMAP · 6 WEEKS
              </span>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-[#5B6E68]">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-3 h-3 bg-[#0F2D29] shrink-0" />
                  Critical Path Dependency
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-3 h-3 bg-[#E98A57] shrink-0" />
                  Sprint Milestone
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-3 h-3 bg-[#8FE3C4] shrink-0" />
                  QA Audit
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[600px] space-y-2">
                {GANTT_ROWS.map((row) => {
                  const isActive = active === row.label;
                  return (
                    <button
                      key={row.label}
                      type="button"
                      onMouseEnter={() => setActive(row.label)}
                      onMouseLeave={() => setActive(null)}
                      onClick={() => toggleActive(row.label)}
                      className={`w-full flex items-center gap-3 py-2.5 px-2 text-left transition border ${
                        isActive ? "bg-[#0F2D29]/5 border-[#0F2D29]" : "border-transparent hover:bg-[#0F2D29]/3"
                      }`}
                    >
                      <div className="w-[180px] sm:w-[220px] shrink-0">
                        <div className="text-[12.5px] font-bold text-[#0F2D29] truncate">
                          {row.label}
                        </div>
                        <div className="text-[10.5px] font-medium text-[#5B6E68] truncate">
                          Assignee: {row.owner}
                        </div>
                      </div>
                      <div className="relative flex-1 h-7 bg-[#0F2D29]/5 overflow-hidden">
                        <div
                          className={`absolute top-1 bottom-1 transition-all duration-200 ${
                            row.critical ? "ring-1 ring-[#0F2D29]" : ""
                          }`}
                          style={{
                            left: `${row.start}%`,
                            width: `${row.width}%`,
                            background: row.color,
                            transform: isActive ? "scaleY(1.1)" : "scaleY(1)",
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};