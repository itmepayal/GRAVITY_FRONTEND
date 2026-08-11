import { COMPANY_LOGOS } from "@/constants/logo";
import { PROJECTS } from "@/constants/task/mockData";

export const LogoStrip = () => {
  const doubled = [...COMPANY_LOGOS, ...COMPANY_LOGOS];

  return (
    <section className="overflow-hidden border-b border-white/8 bg-[#081E1B] px-4 py-9 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-[1160px]">
        <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-[#5C766E] sm:text-[12px]">
          Powering task delivery for {PROJECTS.length} active projects across
          enterprise workspaces
        </p>
      </div>
      <div className="relative w-full overflow-hidden mask-fade">
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 sm:gap-12 md:gap-14">
          {doubled.map(({ name, Icon }, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center gap-2.5 text-[14px] font-semibold text-white/25 transition-colors hover:text-[#8FE3C4]/60 sm:text-[15px] md:text-[16px]"
            >
              <Icon size={28} />
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
