import { useState } from "react";
import { Reveal } from "@/components/common/reveal";
import { Badge } from "@/components/common/badge";
import { GANTT_ROWS } from "@/constants/gantt";
import { LANDING_PROJECT } from "@/constants/task/landingData";

export const GanttChart = () => {
  const [active, setActive] = useState<string | null>(null);

  const toggleActive = (label: string) =>
    setActive((current) => (current === label ? null : label));

  return (
    <section id="templates" className="border-b border-[#0F2D29]/10 bg-[#F8F7F3]">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 sm:py-18 md:px-8 lg:px-12 lg:py-22 xl:px-16">
        <Badge
          eyebrow="Sprint Gantt Timeline"
          title="Drag milestones — dependencies recalculate instantly"
          description={`${LANDING_PROJECT.name} roadmap with critical path highlighting. Move any task and downstream dependencies update in real time.`}
        />
        <Reveal delay={100}>
          <div className="border border-[#0F2D29]/12 bg-white p-4 shadow-[0_2px_12px_rgba(15,45,41,0.04)] sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-3 border-b border-[#0F2D29]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="bg-[#0F2D29]/5 px-3 py-1.5 text-[12px] font-extrabold uppercase tracking-wider text-[#0F2D29]">
                {LANDING_PROJECT.name} · 6-week sprint
              </span>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-[#5B6E68]">
                <div className="flex shrink-0 items-center gap-2">
                  <span className="h-3 w-3 shrink-0 bg-[#0F2D29]" />
                  Critical path
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="h-3 w-3 shrink-0 bg-[#E98A57]" />
                  Blocked / milestone
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="h-3 w-3 shrink-0 bg-[#8FE3C4]" />
                  QA & testing
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[600px] space-y-1.5">
                {GANTT_ROWS.map((row) => {
                  const isActive = active === row.label;
                  return (
                    <button
                      key={row.label}
                      type="button"
                      onMouseEnter={() => setActive(row.label)}
                      onMouseLeave={() => setActive(null)}
                      onClick={() => toggleActive(row.label)}
                      className={`flex w-full items-center gap-3 px-2 py-2.5 text-left transition ${
                        isActive
                          ? "border border-[#0F2D29] bg-[#0F2D29]/5"
                          : "border border-transparent hover:bg-[#0F2D29]/3"
                      }`}
                    >
                      <div className="w-[180px] shrink-0 sm:w-[240px]">
                        <div className="truncate text-[12.5px] font-bold text-[#0F2D29]">
                          {row.label}
                        </div>
                        <div className="truncate text-[10.5px] font-medium text-[#5B6E68]">
                          Assignee: {row.owner}
                        </div>
                      </div>
                      <div className="relative h-7 flex-1 overflow-hidden bg-[#0F2D29]/5">
                        <div
                          className={`absolute top-1 bottom-1 transition-all duration-200 ${
                            row.critical ? "ring-1 ring-[#0F2D29]" : ""
                          }`}
                          style={{
                            left: `${row.start}%`,
                            width: `${row.width}%`,
                            background: row.color,
                            transform: isActive ? "scaleY(1.12)" : "scaleY(1)",
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
