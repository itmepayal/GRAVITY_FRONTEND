import { Pill } from "@/components/common/pill";
import { Highlight } from "@/components/common/highlight";
import { DependencyGraph } from "@/components/common/graph";

export const Hero = () => {
  return (
    <section className="bg-[#0F2D29] relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 -right-24 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[520px] lg:h-[520px] rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #8FE3C4 0%, transparent 70%)",
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 sm:gap-12 lg:gap-14 items-center relative">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-[#B7CFC7] bg-white/5 border border-white/10 rounded-md px-3 py-1.5 mb-6 sm:mb-7 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FE3C4] animate-pulse shrink-0" />
              Advanced scheduling, built in
            </div>

            <h1 className="text-white text-[28px] xs:text-[32px] sm:text-[36px] md:text-[42px] lg:text-[46px] font-bold leading-[1.15] tracking-tight mb-5 sm:mb-6">
              Scheduling software that finds your{" "}
              <Highlight><span className="capitalize">critical path</span></Highlight> automatically
            </h1>

            <p className="text-[#B7CFC7] text-[15px] sm:text-[16px] max-w-[440px] mx-auto lg:mx-0 mb-7 sm:mb-8 leading-relaxed">
              Waypoint tracks every dependency, resequences your schedule the
              moment something slips, and runs the coordination rules your
              team used to do by hand.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-2 sm:mb-9">
              <Pill icon>Sign In</Pill>
              <Pill variant="outline" dark>
                Read More
              </Pill>
            </div>
          </div>

          <div className="relative w-full max-w-full overflow-hidden pb-6 sm:pb-8 lg:pb-10">
            <DependencyGraph />
          </div>
        </div>
      </div>
    </section>
  );
};
