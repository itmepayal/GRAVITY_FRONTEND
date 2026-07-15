import { Badge } from "../common/badge";
import { FEATURES } from "@/constants/feature";
import { Reveal } from "../common/reveal";

export const FeatureLineup = () => {
  return (
    <section id="features" className="bg-[#FBF3E6]">
      <div className="max-w-[1400px] mx-auto py-6 sm:py-8 md:py-9 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
        <Badge
          eyebrow="Platform"
          title="Built for schedules with real stakes"
          description="Every feature exists to answer one question honestly: are we still going to hit the date."
        />
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 80}>
                <div className="bg-white rounded-2xl p-5 flex flex-col h-full hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,45,41,0.08)] transition-all duration-200 border border-[#0F2D29]/8">
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${card.accent}1A`,
                        color: card.accent,
                      }}
                    >
                      <Icon size={19} strokeWidth={2} />
                    </div>
                    <span
                      className="text-[10.5px] font-semibold"
                      style={{ color: card.accent }}
                    >
                      {card.stat}
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-semibold text-[#5E6D68] uppercase tracking-wide mb-1.5"
                  >
                    {card.tag}
                  </span>
                  <h3
                    className="text-[16px] font-semibold mb-2 leading-snug"
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[13px] text-[#5E6D68] leading-relaxed"
                  >
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
}
