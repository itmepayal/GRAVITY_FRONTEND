import { COMPANY_LOGOS } from "@/constants/logo";

export const LogoStrip = () => {
  const doubled = [...COMPANY_LOGOS, ...COMPANY_LOGOS];

  return (
    <section className="bg-[#FBF3E6] py-8 sm:py-9 md:py-10 px-4 sm:px-6 lg:px-10 border-b border-[#0F2D29]/8 overflow-hidden">
      <div className="max-w-[1160px] mx-auto">
        <div className="text-center text-[11px] sm:text-[12px] text-[#5E6D68] mb-5 sm:mb-6">
          Running schedules for delivery teams at growing companies
        </div>
      </div>
 
      <div className="relative w-full overflow-hidden mask-fade">
        <div className="flex gap-10 sm:gap-12 md:gap-14 w-max animate-[marquee_28s_linear_infinite]">
          {doubled.map(({ name, Icon }, i) => (
            <span
              key={i}
              className="flex items-center gap-2 text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-[#0F2D29]/35 hover:text-[#0F2D29]/60 transition-colors shrink-0"
            >
              <Icon size={30} />
              {name}
            </span>
          ))}
        </div>
      </div> 
    </section>
  );
};
