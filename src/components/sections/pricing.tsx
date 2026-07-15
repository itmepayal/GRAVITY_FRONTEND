import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/common/badge";
import { PRICING_PLANS } from "@/constants/pricing";
import { Reveal } from "@/components/common/reveal";

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="bg-[#F2EADA]">
      <div className="max-w-[1400px] mx-auto py-6 sm:py-8 md:py-9 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
        <Badge
          eyebrow="Pricing"
          title="Start free. Grow into the schedule you need."
          description="Every plan gets dependencies and the critical path view — nothing structural is locked away just to force an upgrade."
        />

        <div className="flex justify-center mb-7 sm:mb-9 md:mb-11">
          <div
            role="group"
            aria-label="Billing period"
            className="inline-flex items-center bg-white rounded-lg p-1 border border-[#0F2D29]/10"
          >
            <button
              type="button"
              onClick={() => setYearly(false)}
              aria-pressed={!yearly}
              className={`px-3.5 sm:px-4 py-2 rounded-md text-[12.5px] sm:text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3FA787] ${
                !yearly ? "bg-[#0F2D29] text-white" : "text-[#5E6D68] hover:text-[#0F2D29]"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              aria-pressed={yearly}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-md text-[12.5px] sm:text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3FA787] ${
                yearly ? "bg-[#0F2D29] text-white" : "text-[#5E6D68] hover:text-[#0F2D29]"
              }`}
            >
              Yearly
              <span
                className={`text-[9.5px] sm:text-[10px] px-1.5 py-0.5 rounded-md whitespace-nowrap ${
                  yearly ? "bg-[#8FE3C4] text-[#0F2D29]" : "bg-[#3FA787]/15 text-[#3FA787]"
                }`}
              >
                -25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
          {PRICING_PLANS.map((plan, i) => {
            const price =
              plan.priceLabel ?? `$${yearly ? plan.yearly : plan.monthly}`;
            return (
              <Reveal key={plan.name} delay={i * 80}>
                <div
                  className={`relative rounded-2xl p-5 sm:p-6 flex flex-col h-full transition-transform duration-200 ${
                    plan.featured
                      ? "bg-[#0F2D29] text-white md:-translate-y-2 shadow-[0_16px_32px_rgba(15,45,41,0.18)] md:shadow-[0_24px_48px_rgba(15,45,41,0.22)]"
                      : "bg-white text-[#0F2D29] border border-[#0F2D29]/8"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 right-5 sm:right-6 bg-[#8FE3C4] text-[#0F2D29] text-[9.5px] sm:text-[10.5px] font-semibold px-2 sm:px-2.5 py-1 rounded-md whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  )}
                  <div className="text-[15px] sm:text-[16px] font-semibold mb-1.5">
                    {plan.name}
                  </div>
                  <div
                    className={`text-[12.5px] sm:text-[13px] mb-4 sm:mb-5 leading-relaxed ${
                      plan.featured ? "text-[#B7CFC7]" : "text-[#5E6D68]"
                    }`}
                  >
                    {plan.description}
                  </div>
                  <div className="text-[28px] sm:text-[32px] md:text-[34px] font-bold mb-1 leading-none">
                    {price}
                    {!plan.priceLabel && (
                      <span
                        className={`text-[12px] sm:text-[13px] font-medium ${
                          plan.featured ? "text-[#B7CFC7]" : "text-[#5E6D68]"
                        }`}
                      >
                        /user/mo
                      </span>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2 sm:gap-2.5 my-4 sm:my-5 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={`text-[12.5px] sm:text-[13px] flex gap-2 ${
                          plan.featured ? "text-[#B7CFC7]" : "text-[#5E6D68]"
                        }`}
                      >
                        <CheckCircle2
                          size={15}
                          className="text-[#3FA787] mt-0.5 shrink-0"
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#"
                    className={`text-center rounded-lg px-4 py-3 sm:py-2.5 text-[13.5px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      plan.featured
                        ? "bg-[#8FE3C4] text-[#0F2D29] hover:bg-[#7BD6B4] focus-visible:outline-white"
                        : "border border-[#0F2D29]/15 hover:bg-[#0F2D29]/5 focus-visible:outline-[#3FA787]"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}