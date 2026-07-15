import { STATS, type Stat } from "@/constants";
import { useReveal } from "@/hooks/use-reveal";
import { useCountUp } from "@/hooks/use-count-up";

export const StatsBar = () => {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <section className="bg-[#143631] border-y border-white/5">
      <div
        ref={ref}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-[1400px] mx-auto py-6 sm:py-8 md:py-9 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40"
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
    <div className="flex flex-col items-center sm:items-start gap-1.5 sm:gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-4 md:p-5 lg:p-6 text-center sm:text-left">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-[#B7CFC7]" strokeWidth={1.75} />
      <div className="text-xl sm:text-2xl md:text-[28px] lg:text-[32px] font-bold text-white">
        {display}
      </div>
      <div className="text-[11px] sm:text-xs md:text-[12.5px] font-medium text-[#B7CFC7]">
        {stat.label}
      </div>
    </div>
  );
};