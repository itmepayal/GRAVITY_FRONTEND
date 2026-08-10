import React from "react";
import type { LucideIcon } from "lucide-react";
import { FONT_GOLDMAN, FONT_POPPINS } from "./design-system";

export interface MetricCardData {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  accentColor: string;
  bgGradient?: string;
}

export interface DashboardMetricsBannerProps {
  cards: MetricCardData[];
}

export const DashboardMetricsBanner: React.FC<DashboardMetricsBannerProps> = ({
  cards,
}) => {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden border border-[#0F2D29]/15 bg-white p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0F2D29] hover:shadow-md bg-gradient-to-br ${
              card.bgGradient || "from-[#0F2D29]/5 to-transparent"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={`text-[12px] font-bold uppercase tracking-wider text-[#5B6E68] ${FONT_GOLDMAN}`}
                >
                  {card.title}
                </p>
                <h3
                  className={`mt-2 text-[28px] font-extrabold text-[#0F2D29] ${FONT_GOLDMAN} tabular-nums`}
                >
                  {card.value}
                </h3>
              </div>
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#0F2D29]/15 bg-[#0F2D29]/5"
                style={{ color: card.accentColor }}
              >
                <Icon size={20} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#0F2D29]/10">
              <span className={`text-[11.5px] font-semibold text-[#5B6E68] ${FONT_POPPINS}`}>
                {card.subtitle}
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: card.accentColor }}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
};
