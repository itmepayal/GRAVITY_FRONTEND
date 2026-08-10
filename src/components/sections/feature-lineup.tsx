import { Badge } from "@/components/common/badge";
import { FEATURES } from "@/constants/feature";
import { Reveal } from "@/components/common/reveal";

export const FeatureLineup = () => {
  return (
    <section id="product" className="bg-[#F8F7F3] border-y border-[#0F2D29]/10">
      <div className="max-w-[1400px] mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <Badge
          eyebrow="Task Platform Capabilities"
          title="Engineered for high-performing engineering teams"
          description="Every feature in Gravity TMS is crafted to eliminate busywork and keep projects shipping on schedule."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 60}>
                <div className="group bg-white p-6 flex flex-col h-full border border-[#0F2D29]/12 shadow-2xs hover:border-[#0F2D29] hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-11 h-11 border border-[#0F2D29]/15 flex items-center justify-center bg-[#0F2D29]/5 text-[#0F2D29] group-hover:bg-[#0F2D29] group-hover:text-white transition-colors"
                    >
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-[#0F2D29]/6 text-[#0F2D29] border border-[#0F2D29]/10">
                      {card.stat}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#5B6E68] uppercase tracking-wider mb-2">
                    {card.tag}
                  </span>
                  <h3 className="text-[18px] font-bold text-[#0F2D29] mb-2.5 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-sm font-['Poppins',sans-serif] text-[#5B6E68] leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
