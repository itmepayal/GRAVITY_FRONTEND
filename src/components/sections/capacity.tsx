import { Reveal } from "@/components/common/reveal";
import { Badge } from "@/components/common/badge";
import { CAPACITY_PEOPLE, CAPACITY_WEEKS, loadColor } from "@/constants/capacity";

export const Capacity = () => {
  return (
    <section id="enterprise" className="bg-[#F8F7F3] border-b border-[#0F2D29]/10">
      <div className="max-w-[1400px] mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <Badge
          eyebrow="Capacity & Workload Planning"
          title="Team Workload Forecast across 5 Weeks"
          description="Every task assignment writes directly to an engineer's real-time capacity. Overcommitments show up here before deadlines slip."
        />
        <Reveal delay={100}>
          <div className="bg-white border border-[#0F2D29]/12 p-4 sm:p-6 lg:p-8 shadow-2xs">
            <div
              className="grid gap-2 mb-3 px-1 border-b border-[#0F2D29]/10 pb-3"
              style={{ gridTemplateColumns: "clamp(120px,24vw,220px) repeat(5, 1fr)" }}
            >
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B6E68]">
                Engineer / Role
              </span>
              {CAPACITY_WEEKS.map((w) => (
                <span
                  key={w}
                  className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F2D29] text-center"
                >
                  {w}
                </span>
              ))}
            </div>

            <div className="flex flex-col divide-y divide-[#0F2D29]/8">
              {CAPACITY_PEOPLE.map((p) => (
                <div
                  key={p.name}
                  className="grid gap-2 items-center py-2.5"
                  style={{ gridTemplateColumns: "clamp(120px,24vw,220px) repeat(5, 1fr)" }}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-[13px] font-bold text-[#0F2D29] truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] font-medium text-[#5B6E68] truncate">
                      {p.role}
                    </div>
                  </div>
                  {p.load.map((pct, i) => (
                    <div
                      key={i}
                      className="h-8 flex items-center justify-center text-[11px] font-extrabold transition-transform border border-[#0F2D29]/10"
                      style={{
                        background: loadColor(pct),
                        color: pct >= 75 ? "#FFFFFF" : "#0F2D29",
                      }}
                    >
                      <span>{pct}%</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 pt-4 border-t border-[#0F2D29]/10 text-[11.5px] font-bold text-[#5B6E68]">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 border border-red-700 bg-red-600 shrink-0" />
                Over-capacity (95%+)
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 border border-[#0F2D29] bg-[#0F2D29] shrink-0" />
                Optimal Load (75% - 94%)
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 border border-[#0F2D29]/20 bg-[#8FE3C4] shrink-0" />
                Available Capacity (40% - 74%)
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 border border-[#0F2D29]/15 bg-[#E5E7EB] shrink-0" />
                Unassigned (&lt; 40%)
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
