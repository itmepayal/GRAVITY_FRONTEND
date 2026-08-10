import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/common/badge";
import { PRICING_PLANS } from "@/constants/pricing";
import { Reveal } from "@/components/common/reveal";

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="bg-[#F8F7F3] border-b border-[#0F2D29]/10">
      <div className="max-w-[1400px] mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <Badge
          eyebrow="Transparent TMS Pricing"
          title="Start Free. Scale as your engineering team grows."
          description="Kanban boards, dependency graphs, and subtask checklists are included in every plan — zero hidden paywalls."
        />

        {/* Toggle Monthly / Yearly */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div
            role="group"
            aria-label="Billing period"
            className="inline-flex items-center bg-white p-1 border border-[#0F2D29]/15 shadow-2xs"
          >
            <button
              type="button"
              onClick={() => setYearly(false)}
              aria-pressed={!yearly}
              className={`px-4 py-2 text-[13px] font-bold transition-all ${
                !yearly ? "bg-[#0F2D29] text-white" : "text-[#5B6E68] hover:text-[#0F2D29]"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              aria-pressed={yearly}
              className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold transition-all ${
                yearly ? "bg-[#0F2D29] text-white" : "text-[#5B6E68] hover:text-[#0F2D29]"
              }`}
            >
              Annual Billing
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 whitespace-nowrap ${
                  yearly ? "bg-[#8FE3C4] text-[#0F2D29]" : "bg-[#0F2D29]/10 text-[#0F2D29]"
                }`}
              >
                SAVE 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PRICING_PLANS.map((plan, i) => {
            const price =
              plan.priceLabel ?? `$${yearly ? plan.yearly : plan.monthly}`;
            return (
              <Reveal key={plan.name} delay={i * 80}>
                <div
                  className={`relative p-6 sm:p-8 flex flex-col h-full border transition-all duration-200 ${
                    plan.featured
                      ? "bg-[#0F2D29] text-white border-[#0F2D29] shadow-xl md:-translate-y-2"
                      : "bg-white text-[#0F2D29] border-[#0F2D29]/15 hover:border-[#0F2D29]"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3.5 right-6 bg-[#8FE3C4] text-[#0F2D29] text-[10.5px] font-extrabold px-3 py-1 uppercase tracking-wider border border-[#0F2D29]">
                      MOST POPULAR
                    </span>
                  )}
                  <div className="text-[18px] font-extrabold mb-1">
                    {plan.name}
                  </div>
                  <div
                    className={`text-[13px] mb-5 leading-relaxed font-medium ${
                      plan.featured ? "text-[#B7CFC7]" : "text-[#5B6E68]"
                    }`}
                  >
                    {plan.description}
                  </div>

                  <div className="text-[36px] font-extrabold mb-2 leading-none">
                    {price}
                    {!plan.priceLabel && (
                      <span
                        className={`text-[13px] font-semibold ${
                          plan.featured ? "text-[#B7CFC7]" : "text-[#5B6E68]"
                        }`}
                      >
                        /user/mo
                      </span>
                    )}
                  </div>

                  <ul className="flex flex-col gap-3 my-6 flex-1 border-t border-b border-[#0F2D29]/10 py-5">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={`text-[13px] font-semibold flex items-center gap-2.5 ${
                          plan.featured ? "text-[#B7CFC7]" : "text-[#0F2D29]"
                        }`}
                      >
                        <CheckCircle2
                          size={16}
                          className={plan.featured ? "text-[#8FE3C4]" : "text-[#0F2D29]"}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/dashboard"
                    className={`flex items-center justify-center gap-2 w-full py-3.5 text-[13.5px] font-extrabold tracking-wide transition ${
                      plan.featured
                        ? "bg-[#8FE3C4] text-[#0F2D29] hover:bg-white"
                        : "bg-[#0F2D29] text-white hover:bg-[#081E1B]"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight size={15} strokeWidth={2.5} />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}