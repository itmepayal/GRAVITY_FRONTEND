import { Reveal } from "@/components/common/reveal";
import { Badge } from "@/components/common/badge";
import { CAPACITY_PEOPLE, CAPACITY_WEEKS, loadColor } from "@/constants/capacity";

export const Capacity = () => {
  return (
    <section id="capacity" className="bg-[#F2EADA]">
      <div className="max-w-[1400px] mx-auto py-6 sm:py-8 md:py-9 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
        <Badge
          eyebrow="Capacity"
          title="Workload, five weeks out"
          description="Every assignment writes to a person's real capacity. Overcommitment shows up here before it shows up in a missed date."
        />
        <Reveal delay={100}>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#0F2D29]/8 p-3 sm:p-5 lg:p-6">
            <div
              className="grid gap-1 sm:gap-2 mb-2 sm:mb-3 px-0.5 sm:px-1"
              style={{ gridTemplateColumns: "clamp(64px,22vw,120px) repeat(5, 1fr)" }}
            >
              <span />
              {CAPACITY_WEEKS.map((w) => (
                <span
                  key={w}
                  className="text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] text-[#5E6D68] text-center truncate"
                >
                  {w}
                </span>
              ))}
            </div>

            <div className="flex flex-col">
              {CAPACITY_PEOPLE.map((p) => (
                <div
                  key={p.name}
                  className="grid gap-1 sm:gap-2 items-center py-1 sm:py-1.5"
                  style={{ gridTemplateColumns: "clamp(64px,22vw,120px) repeat(5, 1fr)" }}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-[10px] xs:text-[11px] sm:text-[12.5px] font-medium text-[#0F2D29] truncate">
                      {p.name}
                    </div>
                    <div className="text-[8px] xs:text-[9px] sm:text-[10px] text-[#5E6D68] truncate">
                      {p.role}
                    </div>
                  </div>
                  {p.load.map((pct, i) => (
                    <div
                      key={i}
                      className="h-6 xs:h-7 sm:h-8 rounded-md flex items-center justify-center text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] font-semibold transition-transform motion-safe:hover:scale-[1.04]"
                      style={{
                        background: loadColor(pct),
                        color: pct >= 75 ? "#FBF3E6" : "#0F2D29",
                      }}
                    >
                      <span>{pct}%</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 mt-4 sm:mt-5 px-0.5 sm:px-1 text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] text-[#5E6D68]">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: "#E98A57" }} />
                At risk (95%+)
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: "#3FA787" }} />
                Full
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: "#8FE3C4" }} />
                Available
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
