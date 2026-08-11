import { STATS, type Stat } from "@/constants";
import { useReveal } from "@/hooks/use-reveal";
import { useCountUp } from "@/hooks/use-count-up";

export const StatsBar = () => {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <section className="border-y border-[#8FE3C4]/15 bg-[#0F2D29] text-white">
      <div
        ref={ref}
        className="mx-auto grid max-w-[1400px] grid-cols-2 gap-3 px-4 py-8 sm:gap-4 sm:px-6 sm:py-12 md:px-8 lg:grid-cols-4 lg:px-12 xl:px-16"
      >
        {STATS.map((s) => (
          <StatItem key={s.label} stat={s} shown={shown} />
        ))}
      </div>
    </section>
  );
};

const StatItem = ({ stat, shown }: { stat: Stat; shown: boolean }) => {
  const display = useCountUp(stat.value, shown);
  const Icon = stat.icon;
  return (
    <div className="group flex flex-col items-center gap-2.5 border border-white/10 bg-white/5 p-5 text-center transition hover:border-[#8FE3C4]/30 hover:bg-white/10 sm:items-start sm:text-left">
      <div className="flex h-10 w-10 items-center justify-center border border-[#8FE3C4]/30 bg-[#8FE3C4]/15 text-[#8FE3C4] transition group-hover:bg-[#8FE3C4]/25">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="mt-0.5 text-[28px] font-extrabold leading-none text-white sm:text-[34px]">
        {display}
      </div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#B7CFC7] sm:text-[12px]">
        {stat.label}
      </div>
    </div>
  );
};
