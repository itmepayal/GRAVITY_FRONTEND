import { Reveal } from "../common/reveal";
import { Badge } from "../common/badge";
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
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#0F2D29]/8 p-3.5 sm:p-5 lg:p-6">
            <div className="-mx-3.5 sm:mx-0 px-3.5 sm:px-0 overflow-x-auto">
              <div className="min-w-[420px] sm:min-w-[480px] lg:min-w-0">
                <div className="grid grid-cols-[88px_repeat(5,1fr)] sm:grid-cols-[110px_repeat(5,1fr)] md:grid-cols-[120px_repeat(5,1fr)] gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 px-1">
                  <span />
                  {CAPACITY_WEEKS.map((w) => (
                    <span key={w} className="text-[9.5px] sm:text-[10.5px] text-[#5E6D68] text-center">
                      {w}
                    </span>
                  ))}
                </div>
                {CAPACITY_PEOPLE.map((p) => (
                  <div
                    key={p.name}
                    className="grid grid-cols-[88px_repeat(5,1fr)] sm:grid-cols-[110px_repeat(5,1fr)] md:grid-cols-[120px_repeat(5,1fr)] gap-1.5 sm:gap-2 items-center py-1 sm:py-1.5"
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] sm:text-[12.5px] font-medium text-[#0F2D29] truncate">
                        {p.name}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-[#5E6D68]">{p.role}</div>
                    </div>
                    {p.load.map((pct, i) => (
                      <div
                        key={i}
                        className="h-7 sm:h-8 rounded-md flex items-center justify-center text-[9.5px] sm:text-[10.5px] font-semibold transition-transform hover:scale-[1.04]"
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
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 sm:mt-5 px-1 text-[9.5px] sm:text-[10.5px] text-[#5E6D68]">
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