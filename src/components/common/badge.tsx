import type { BadgeProps } from "@/types";
import { Reveal } from "@/components/common/reveal";

export const Badge = ({
  eyebrow,
  title,
  description,
  dark = false,
}: BadgeProps) => {
  return (
    <Reveal>
      <div className="w-full max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center mb-10 sm:mb-12 lg:mb-14">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] ${
            dark
              ? "bg-white/10 text-[#8FE3C4]"
              : "bg-[#3FA787]/10 text-[#3FA787]"
          }`}
        >
          {eyebrow}
        </span>

        <h2
          className={`mt-4 font-bold leading-tight tracking-tight
            text-3xl
            sm:text-4xl
            lg:text-5xl
            ${
              dark ? "text-white" : "text-[#0F2D29]"
            }`}
        >
          {title}
        </h2>

        {description && (
          <p
            className={`mt-4 mx-auto max-w-2xl
              text-sm
              sm:text-base
              lg:text-lg
              leading-7
              ${
                dark ? "text-[#B7CFC7]" : "text-[#5E6D68]"
              }`}
          >
            {description}
          </p>
        )}
      </div>
    </Reveal>
  );
};