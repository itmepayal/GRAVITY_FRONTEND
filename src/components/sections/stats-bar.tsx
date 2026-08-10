import { STATS, type Stat } from "@/constants";
import { useReveal } from "@/hooks/use-reveal";
import { useCountUp } from "@/hooks/use-count-up";

export const StatsBar = () => {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <section className="bg-[#0F2D29] border-y border-[#8FE3C4]/20 text-white">
      <div
        ref={ref}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1400px] mx-auto py-8 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
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
    <div className="flex flex-col items-center sm:items-start gap-2 border border-white/12 bg-white/5 p-5 text-center sm:text-left transition hover:bg-white/10">
      <div className="flex h-10 w-10 items-center justify-center border border-[#8FE3C4]/30 bg-[#8FE3C4]/15 text-[#8FE3C4]">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="text-[28px] sm:text-[34px] font-extrabold text-white leading-none mt-1">
        {display}
      </div>
      <div className="text-[12px] sm:text-[13px] font-bold text-[#B7CFC7] uppercase tracking-wider">
        {stat.label}
      </div>
    </div>
  );
};