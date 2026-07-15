import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "../common/badge";
import { PRICING_PLANS } from "@/constants/pricing";
import { Reveal } from "../common/reveal";

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

        <div className="flex justify-center mb-11">
          <div className="inline-flex items-center bg-white rounded-lg p-1 border border-[#0F2D29]/10">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${!yearly ? "bg-[#0F2D29] text-white" : "text-[#5E6D68]"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${yearly ? "bg-[#0F2D29] text-white" : "text-[#5E6D68]"}`}
            >
              Yearly
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md ${yearly ? "bg-[#8FE3C4] text-[#0F2D29]" : "bg-[#3FA787]/15 text-[#3FA787]"}`}
              >
                -25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {PRICING_PLANS.map((plan, i) => {
            const price =
              plan.priceLabel ?? `$${yearly ? plan.yearly : plan.monthly}`;
            return (
              <Reveal key={plan.name} delay={i * 80}>
                <div
                  className={`relative rounded-2xl p-6 flex flex-col h-full transition-transform duration-200 ${plan.featured ? "bg-[#0F2D29] text-white md:-translate-y-2 shadow-[0_24px_48px_rgba(15,45,41,0.22)]" : "bg-white text-[#0F2D29] border border-[#0F2D29]/8"}`}
                >
                  {plan.featured && (
                    <span
                      className="absolute -top-3 right-6 bg-[#8FE3C4] text-[#0F2D29] text-[10.5px] font-semibold px-2.5 py-1 rounded-md"
                    >
                      MOST POPULAR
                    </span>
                  )}
                  <div
                    className="text-[16px] font-semibold mb-1.5"
                  >
                    {plan.name}
                  </div>
                  <div
                    className={`text-[13px] mb-5 ${plan.featured ? "text-[#B7CFC7]" : "text-[#5E6D68]"}`}
                  >
                    {plan.description}
                  </div>
                  <div className="text-[34px] font-bold mb-1">
                    {price}
                    {!plan.priceLabel && (
                      <span
                        className={`text-[13px] font-medium ${plan.featured ? "text-[#B7CFC7]" : "text-[#5E6D68]"}`}
                      >
                        /user/mo
                      </span>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2.5 my-5 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={`text-[13px] flex gap-2 ${plan.featured ? "text-[#B7CFC7]" : "text-[#5E6D68]"}`}
                      >
                        <CheckCircle2
                          size={15}
                          className="text-[#3FA787] mt-0.5 shrink-0"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#"
                    className={`text-center rounded-lg px-4 py-2.5 text-[13.5px] font-semibold transition-colors ${plan.featured ? "bg-[#8FE3C4] text-[#0F2D29] hover:bg-[#7BD6B4]" : "border border-[#0F2D29]/15 hover:bg-[#0F2D29]/5"}`}
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