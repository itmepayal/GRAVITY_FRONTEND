import { Badge } from "@/components/common/badge";
import { FEATURES } from "@/constants/feature";
import { Reveal } from "@/components/common/reveal";

export const FeatureLineup = () => {
  return (
    <section id="product" className="border-y border-[#0F2D29]/10 bg-[#F8F7F3]">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 sm:py-18 md:px-8 lg:px-12 lg:py-22 xl:px-16">
        <Badge
          eyebrow="Task Management Platform"
          title="Built for teams that ship on schedule"
          description="Kanban boards, sprint planning, subtasks, comments, and RBAC — every tool your engineering team needs in one workspace."
        />
        <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {FEATURES.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 60}>
                <div className="group flex h-full flex-col border border-[#0F2D29]/12 bg-white p-6 shadow-[0_2px_12px_rgba(15,45,41,0.04)] transition-all duration-200 hover:border-[#0F2D29] hover:shadow-[0_8px_28px_rgba(15,45,41,0.1)]">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center border border-[#0F2D29]/15 bg-[#0F2D29]/5 text-[#0F2D29] transition-colors group-hover:bg-[#0F2D29] group-hover:text-white">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <span className="border border-[#0F2D29]/10 bg-[#0F2D29]/6 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#0F2D29]">
                      {card.stat}
                    </span>
                  </div>
                  <span className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">
                    {card.tag}
                  </span>
                  <h3 className="mb-2.5 text-[18px] font-bold leading-snug text-[#0F2D29]">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#5B6E68]">
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
